import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Task } from '../../tasks/schemas/task.schema';
import { LearningActivity } from '../../learning-activities/schemas/learning-activity.schema';
import { LearningJournal } from '../../learning-journals/schemas/learning-journal.schema';
import { Message } from '../../messages/schemas/message.schema';
import { Course } from '../../courses/schemas/course.schema';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { UserRole, UserStatus, TaskStatus } from '../../../common/constants/enums.constant';
import {
  paginatedResponse,
  ResponseMessage,
  successResponse,
} from '../../../common/constants/responses.constant';
import { AssignLearnerDto } from '../dto/assign-learner.dto';
import { ListMyLearnersDto } from '../dto/list-my-learners.dto';
import { ReportParamsDto } from '../dto/report-params.dto';

@Injectable()
export class TrainerService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel(LearningActivity.name)
    private readonly activityModel: Model<LearningActivity>,
    @InjectModel(LearningJournal.name)
    private readonly journalModel: Model<LearningJournal>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<Course>,
  ) {}

  // ── Helper: get IDs of learners assigned to this trainer ──────────────────

  private async getMyLearnerIds(trainerId: string): Promise<Types.ObjectId[]> {
    const trainerObjId = new Types.ObjectId(trainerId);

    // Source 1: learners directly assigned via trainerId or assignedTrainerId
    const directLearners = await this.userModel
      .find(
        {
          $or: [
            { trainerId: trainerObjId },
            { assignedTrainerId: trainerObjId },
          ],
          role: UserRole.LEARNER,
          status: { $ne: UserStatus.DELETED },
        },
        { _id: 1 },
      )
      .lean();

    // Source 2: users enrolled in courses the trainer created OR is assigned to
    const trainerCourses = await this.courseModel
      .find(
        {
          $or: [
            { createdBy: trainerObjId },
            { assignedTrainers: trainerObjId },
          ],
          isDeleted: false,
        },
        { enrolledUsers: 1 },
      )
      .lean();

    const enrolledFromCourses: Types.ObjectId[] = trainerCourses.flatMap(
      (c) => (c.enrolledUsers ?? []) as Types.ObjectId[],
    );

    // Merge and deduplicate
    const seen = new Set<string>();
    const all: Types.ObjectId[] = [];
    for (const id of [
      ...directLearners.map((l) => l._id as Types.ObjectId),
      ...enrolledFromCourses,
    ]) {
      const key = id.toString();
      if (!seen.has(key)) {
        seen.add(key);
        all.push(id);
      }
    }
    return all;
  }

  // ── My Learners ──────────────────────────────────────────────────────────

  async getMyLearners(dto: ListMyLearnersDto, currentUser: IAuthUser) {
    const trainerId = new Types.ObjectId(currentUser._id);
    const page = Math.max(1, parseInt(String(dto.page ?? 1), 10) || 1);
    const limit = Math.max(1, parseInt(String(dto.limit ?? 10), 10) || 10);

    const filter: any = {
      trainerId,
      role: UserRole.LEARNER,
      status: { $ne: UserStatus.DELETED },
    };

    if (dto.search) {
      const regex = new RegExp(dto.search, 'i');
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
      ];
    }
    if (dto.cohort) filter.cohort = dto.cohort;
    if (dto.programme) filter.programme = dto.programme;

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter, { passwordHash: 0 })
        .sort({ firstName: 1, lastName: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(filter),
    ]);

    // Enrich each learner with task/progress stats
    const enriched = await Promise.all(
      data.map(async (learner) => {
        const learnerId = learner._id as Types.ObjectId;
        const [totalTasks, completedTasks, pendingTasks, totalActivities, unreadMessages] =
          await Promise.all([
            this.taskModel.countDocuments({
              $or: [
                { assignedTo: learnerId },
                { createdBy: learnerId },
              ],
              isDeleted: false,
            }),
            this.taskModel.countDocuments({
              $or: [
                { assignedTo: learnerId },
                { createdBy: learnerId },
              ],
              isDeleted: false,
              status: TaskStatus.COMPLETED,
            }),
            this.taskModel.countDocuments({
              $or: [
                { assignedTo: learnerId },
                { createdBy: learnerId },
              ],
              isDeleted: false,
              status: TaskStatus.PENDING,
            }),
            this.activityModel.countDocuments({
              createdBy: learnerId,
              isDeleted: false,
            }),
            this.messageModel.countDocuments({
              recipientId: learnerId,
              isRead: false,
              isDeleted: false,
            }),
          ]);

        const progressPercent =
          totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0;

        return {
          ...learner,
          stats: {
            totalTasks,
            completedTasks,
            pendingTasks,
            totalActivities,
            unreadMessages,
            progressPercent,
          },
        };
      }),
    );

    return paginatedResponse(enriched, total, page, limit);
  }

  // ── Assign / Unassign Learner ─────────────────────────────────────────────

  async assignLearner(dto: AssignLearnerDto, currentUser: IAuthUser) {
    const trainerId = new Types.ObjectId(currentUser._id);
    const learnerId = new Types.ObjectId(dto.learnerId);

    const learner = await this.userModel.findOne({
      _id: learnerId,
      role: UserRole.LEARNER,
    });
    if (!learner) throw new NotFoundException('Learner not found.');

    const update: any = { trainerId };
    if (dto.cohort) update.cohort = dto.cohort;
    if (dto.programme) update.programme = dto.programme;
    if (dto.employer) update.employer = dto.employer;

    const updated = await this.userModel.findOneAndUpdate(
      { _id: learnerId },
      { $set: update },
      { new: true, lean: true },
    );

    const { passwordHash: _pw, ...safe } = updated as any;
    return successResponse(safe, 'Learner assigned successfully');
  }

  async unassignLearner(learnerId: string, currentUser: IAuthUser) {
    const trainerId = new Types.ObjectId(currentUser._id);

    const learner = await this.userModel.findOne({
      _id: new Types.ObjectId(learnerId),
      trainerId,
      role: UserRole.LEARNER,
    });
    if (!learner) throw new NotFoundException('Learner not found or not assigned to you.');

    const updated = await this.userModel.findOneAndUpdate(
      { _id: new Types.ObjectId(learnerId) },
      { $set: { trainerId: null } },
      { new: true, lean: true },
    );

    const { passwordHash: _pw, ...safe } = updated as any;
    return successResponse(safe, 'Learner unassigned successfully');
  }

  // ── Learner Detail ────────────────────────────────────────────────────────

  async getLearnerDetail(learnerId: string, currentUser: IAuthUser) {
    const trainerId = new Types.ObjectId(currentUser._id);

    const learner = await this.userModel.findOne(
      {
        _id: new Types.ObjectId(learnerId),
        trainerId,
        role: UserRole.LEARNER,
      },
      { passwordHash: 0 },
    ).lean();

    if (!learner)
      throw new NotFoundException('Learner not found or not assigned to you.');

    const lid = learner._id as Types.ObjectId;

    const [totalTasks, completedTasks, pendingTasks, inProgressTasks, totalActivities, totalJournals, recentTasks] =
      await Promise.all([
        this.taskModel.countDocuments({
          $or: [{ assignedTo: lid }, { createdBy: lid }],
          isDeleted: false,
        }),
        this.taskModel.countDocuments({
          $or: [{ assignedTo: lid }, { createdBy: lid }],
          isDeleted: false,
          status: TaskStatus.COMPLETED,
        }),
        this.taskModel.countDocuments({
          $or: [{ assignedTo: lid }, { createdBy: lid }],
          isDeleted: false,
          status: TaskStatus.PENDING,
        }),
        this.taskModel.countDocuments({
          $or: [{ assignedTo: lid }, { createdBy: lid }],
          isDeleted: false,
          status: TaskStatus.IN_PROGRESS,
        }),
        this.activityModel.countDocuments({ createdBy: lid, isDeleted: false }),
        this.journalModel.countDocuments({ createdBy: lid, isDeleted: false }),
        this.taskModel
          .find({
            $or: [{ assignedTo: lid }, { createdBy: lid }],
            isDeleted: false,
          })
          .sort({ updatedAt: -1 })
          .limit(5)
          .lean(),
      ]);

    const progressPercent =
      totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    return successResponse({
      ...learner,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        totalActivities,
        totalJournals,
        progressPercent,
      },
      recentTasks,
    });
  }

  // ── Learner Portfolio ─────────────────────────────────────────────────────

  async getLearnerPortfolio(learnerId: string, currentUser: IAuthUser) {
    const trainerId = new Types.ObjectId(currentUser._id);
    const lid = new Types.ObjectId(learnerId);

    // Verify assignment
    const learner = await this.userModel.findOne(
      { _id: lid, trainerId, role: UserRole.LEARNER },
      { passwordHash: 0 },
    ).lean();
    if (!learner)
      throw new NotFoundException('Learner not found or not assigned to you.');

    const [tasks, activities, journals] = await Promise.all([
      this.taskModel
        .find({
          $or: [{ assignedTo: lid }, { createdBy: lid }],
          isDeleted: false,
        })
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean(),
      this.activityModel
        .find({ createdBy: lid, isDeleted: false })
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean(),
      this.journalModel
        .find({ createdBy: lid, isDeleted: false })
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean(),
    ]);

    return successResponse({
      learner,
      tasks,
      activities,
      journals,
    });
  }

  // ── Learner Progress ──────────────────────────────────────────────────────

  async getLearnerProgress(learnerId: string, currentUser: IAuthUser) {
    const trainerId = new Types.ObjectId(currentUser._id);
    const lid = new Types.ObjectId(learnerId);

    const learner = await this.userModel.findOne(
      { _id: lid, trainerId, role: UserRole.LEARNER },
      { passwordHash: 0 },
    ).lean();
    if (!learner)
      throw new NotFoundException('Learner not found or not assigned to you.');

    // Task stats grouped by status
    const tasksByStatus = await this.taskModel.aggregate([
      {
        $match: {
          $or: [{ assignedTo: lid }, { createdBy: lid }],
          isDeleted: false,
        },
      },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Activities grouped by type
    const activitiesByType = await this.activityModel.aggregate([
      { $match: { createdBy: lid, isDeleted: false } },
      { $group: { _id: '$activityType', count: { $sum: 1 } } },
    ]);

    // Journal count by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const journalsByMonth = await this.journalModel.aggregate([
      {
        $match: {
          createdBy: lid,
          isDeleted: false,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return successResponse({
      learner,
      tasksByStatus,
      activitiesByType,
      journalsByMonth,
    });
  }

  // ── Trainer Dashboard Stats (scoped to assigned learners) ─────────────────

  async getDashboardStats(currentUser: IAuthUser) {
    const trainerId = new Types.ObjectId(currentUser._id);
    const learnerIds = await this.getMyLearnerIds(currentUser._id);

    // Tasks: created by trainer, or assigned to / created by any of their learners
    const taskOwnerIds = [trainerId, ...learnerIds];
    const taskBaseFilter: any = {
      $or: taskOwnerIds.flatMap((id) => [
        { createdBy: id },
        { assignedTo: id },
      ]),
      isDeleted: false,
    };

    const [
      totalLearners,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      totalActivities,
      unreadMessages,
      totalCourses,
    ] = await Promise.all([
      // Learner count: unique IDs already computed in getMyLearnerIds
      Promise.resolve(learnerIds.length),
      this.taskModel.countDocuments(taskBaseFilter),
      this.taskModel.countDocuments({ ...taskBaseFilter, status: TaskStatus.PENDING }),
      this.taskModel.countDocuments({ ...taskBaseFilter, status: TaskStatus.IN_PROGRESS }),
      this.taskModel.countDocuments({ ...taskBaseFilter, status: TaskStatus.COMPLETED }),
      this.activityModel.countDocuments({
        createdBy: { $in: [trainerId, ...learnerIds] },
        isDeleted: false,
      }),
      this.messageModel.countDocuments({
        recipientId: trainerId,
        isRead: false,
        isDeleted: false,
      }),
      this.courseModel.countDocuments({
        $or: [
          { createdBy: trainerId },
          { assignedTrainers: trainerId },
        ],
        isDeleted: false,
      }),
    ]);

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return successResponse({
      learners: { total: totalLearners },
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        completionRate,
      },
      activities: { total: totalActivities },
      messages: { unread: unreadMessages },
      courses: { total: totalCourses },
    });
  }

  // ── Dashboard Charts (all widgets in one request) ────────────────────────

  async getDashboardCharts(currentUser: IAuthUser) {
    const trainerId = new Types.ObjectId(currentUser._id);

    // Use the fixed helper — finds learners via trainerId, assignedTrainerId,
    // AND enrolled users in courses the trainer created or is assigned to
    const learnerIds = await this.getMyLearnerIds(currentUser._id);

    // Fetch full learner documents for per-learner widgets
    const allLearners =
      learnerIds.length > 0
        ? await this.userModel
            .find({ _id: { $in: learnerIds } }, { passwordHash: 0 })
            .lean()
        : [];

    // Task scope: trainer's own tasks + all learner tasks
    const taskOwnerIds = [trainerId, ...learnerIds];
    const taskScopeOr = taskOwnerIds.flatMap((id) => [
      { assignedTo: id },
      { createdBy: id },
    ]);

    const now = new Date();
    const daysDiff = (d: Date) =>
      Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    const daysUntil = (d: Date) =>
      Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // ── 1. Completed visits (last 30 days) ──────────────────────────────────
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const completedTasks = await this.taskModel
      .find({
        $or: taskScopeOr,
        isDeleted: false,
        status: TaskStatus.COMPLETED,
        updatedAt: { $gte: thirtyDaysAgo },
      })
      .lean();

    const cvBuckets = { aboveNinety: 0, eightyToNinety: 0, belowEighty: 0 };
    await Promise.all(
      completedTasks.map(async (task: any) => {
        const lid = task.assignedTo || task.createdBy;
        if (!lid) { cvBuckets.belowEighty++; return; }
        const [tot, comp] = await Promise.all([
          this.taskModel.countDocuments({ $or: [{ assignedTo: lid }, { createdBy: lid }], isDeleted: false }),
          this.taskModel.countDocuments({ $or: [{ assignedTo: lid }, { createdBy: lid }], isDeleted: false, status: TaskStatus.COMPLETED }),
        ]);
        const pct = tot > 0 ? (comp / tot) * 100 : 0;
        if (pct >= 90) cvBuckets.aboveNinety++;
        else if (pct >= 80) cvBuckets.eightyToNinety++;
        else cvBuckets.belowEighty++;
      }),
    );
    const cvTotal = completedTasks.length;
    const cvPercent = cvTotal > 0
      ? Math.round(((cvBuckets.aboveNinety + cvBuckets.eightyToNinety) / cvTotal) * 100)
      : 0;

    // ── 2. Planned visits (next 30 days) ────────────────────────────────────
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const plannedTasks = await this.taskModel
      .find({
        $or: taskScopeOr,
        isDeleted: false,
        status: { $ne: TaskStatus.COMPLETED },
        dueDate: { $gte: now, $lte: thirtyDaysFromNow },
      })
      .lean();

    const pvBuckets = { aboveNinety: 0, eightyToNinety: 0, belowEighty: 0 };
    await Promise.all(
      plannedTasks.map(async (task: any) => {
        const lid = task.assignedTo || task.createdBy;
        if (!lid) { pvBuckets.belowEighty++; return; }
        const [tot, comp] = await Promise.all([
          this.taskModel.countDocuments({ $or: [{ assignedTo: lid }, { createdBy: lid }], isDeleted: false }),
          this.taskModel.countDocuments({ $or: [{ assignedTo: lid }, { createdBy: lid }], isDeleted: false, status: TaskStatus.COMPLETED }),
        ]);
        const pct = tot > 0 ? (comp / tot) * 100 : 0;
        if (pct >= 90) pvBuckets.aboveNinety++;
        else if (pct >= 80) pvBuckets.eightyToNinety++;
        else pvBuckets.belowEighty++;
      }),
    );
    const pvTotal = plannedTasks.length;
    const pvPercent = pvTotal > 0
      ? Math.round(((pvBuckets.aboveNinety + pvBuckets.eightyToNinety) / pvTotal) * 100)
      : 0;

    // ── 3. IQA Actions ──────────────────────────────────────────────────────
    const iqaCount = await this.taskModel.countDocuments({
      $or: taskScopeOr,
      isDeleted: false,
      status: { $in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] },
      $and: [{
        $or: [
          { primaryMethod: { $regex: /iqa/i } },
          { title: { $regex: /iqa|quality/i } },
        ],
      }],
    });

    // ── 4. Learners due to complete in next 90 days ──────────────────────────
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const learnersDue: any[] = [];
    for (const l of allLearners) {
      const endDate: Date | null = (l as any).programEndDate || null;
      if (endDate) {
        const dLeft = daysUntil(endDate);
        if (dLeft <= 90) {
          learnersDue.push({ _id: l._id, firstName: l.firstName, lastName: l.lastName, daysRemaining: dLeft });
        }
      } else {
        const lt = await this.taskModel
          .findOne({
            $or: [{ assignedTo: l._id }, { createdBy: l._id }],
            isDeleted: false,
            status: { $ne: TaskStatus.COMPLETED },
            dueDate: { $gte: now, $lte: ninetyDaysFromNow },
          })
          .sort({ dueDate: 1 })
          .lean();
        if (lt?.dueDate) {
          learnersDue.push({ _id: l._id, firstName: l.firstName, lastName: l.lastName, daysRemaining: daysUntil(lt.dueDate) });
        }
      }
    }
    learnersDue.sort((a, b) => a.daysRemaining - b.daysRemaining);

    // ── 5. Learners last logged in ───────────────────────────────────────────
    const loggedInBuckets = { within7Days: 0, eightTo30Days: 0, over30Days: 0 };
    for (const l of allLearners) {
      const last = (l as any).lastActivityAt as Date | null;
      if (!last) { loggedInBuckets.over30Days++; continue; }
      const days = daysDiff(last);
      if (days <= 7) loggedInBuckets.within7Days++;
      else if (days <= 30) loggedInBuckets.eightTo30Days++;
      else loggedInBuckets.over30Days++;
    }

    // ── 6. Learners on target (task completion) ──────────────────────────────
    const targetBuckets = { behind: 0, onTarget: 0, ahead: 0 };
    for (const l of allLearners) {
      const lid = l._id as Types.ObjectId;
      const [tot, comp] = await Promise.all([
        this.taskModel.countDocuments({ $or: [{ assignedTo: lid }, { createdBy: lid }], isDeleted: false }),
        this.taskModel.countDocuments({ $or: [{ assignedTo: lid }, { createdBy: lid }], isDeleted: false, status: TaskStatus.COMPLETED }),
      ]);
      const pct = tot > 0 ? (comp / tot) * 100 : 0;
      if (pct >= 80) targetBuckets.ahead++;
      else if (pct >= 40) targetBuckets.onTarget++;
      else targetBuckets.behind++;
    }

    // ── 7. Learners on target OTJ ────────────────────────────────────────────
    const otjBuckets = { behind: 0, onTarget: 0, ahead: 0 };
    for (const l of allLearners) {
      const lid = l._id as Types.ObjectId;
      const otjActs = await this.activityModel
        .find({
          $or: [{ createdBy: lid }, { learnerId: lid }],
          isDeleted: false,
          type: 'OFF_THE_JOB',
        })
        .lean();
      const actual = otjActs.reduce((s, a) => s + ((a as any).offTheJobHours || 0), 0);
      const pct = (actual / 100) * 100;
      if (pct >= 80) otjBuckets.ahead++;
      else if (pct >= 40) otjBuckets.onTarget++;
      else otjBuckets.behind++;
    }

    // ── 8. No OTJ activity ───────────────────────────────────────────────────
    const noOtjBuckets = { over4Weeks: 0, threeToFour: 0, twoToThree: 0, oneToTwo: 0, learningBreak: 0 };
    for (const l of allLearners) {
      const lid = l._id as Types.ObjectId;
      const lastOTJ = await this.activityModel
        .findOne({
          $or: [{ createdBy: lid }, { learnerId: lid }],
          isDeleted: false,
          type: 'OFF_THE_JOB',
        })
        .sort({ updatedAt: -1 })
        .lean();
      if (!lastOTJ) { noOtjBuckets.over4Weeks++; continue; }
      const days = daysDiff((lastOTJ as any).updatedAt || (lastOTJ as any).createdAt);
      if (days > 28) noOtjBuckets.over4Weeks++;
      else if (days > 21) noOtjBuckets.threeToFour++;
      else if (days > 14) noOtjBuckets.twoToThree++;
      else if (days > 7) noOtjBuckets.oneToTwo++;
      else noOtjBuckets.learningBreak++;
    }

    // ── 9. Progress reviews due ──────────────────────────────────────────────
    const prDue = { overdue: 0, within7Days: 0, sevenTo14Days: 0, fourteenTo28Days: 0 };
    const reviewTasks = await this.taskModel
      .find({
        $or: taskScopeOr,
        isDeleted: false,
        status: { $in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] },
        dueDate: { $ne: null },
      })
      .lean();
    for (const t of reviewTasks) {
      if (!t.dueDate) continue;
      const days = daysUntil(t.dueDate);
      if (days < 0) prDue.overdue++;
      else if (days <= 7) prDue.within7Days++;
      else if (days <= 14) prDue.sevenTo14Days++;
      else if (days <= 28) prDue.fourteenTo28Days++;
    }

    // ── 10. Tasks due ────────────────────────────────────────────────────────
    const tasksDue = { immediately: 0, thisWeek: 0, nextWeek: 0, inTwoWeeks: 0 };
    const pendingTasksList = await this.taskModel
      .find({
        $or: taskScopeOr,
        isDeleted: false,
        status: { $in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] },
      })
      .lean();
    for (const t of pendingTasksList) {
      if (!t.dueDate) continue;
      const days = daysUntil(t.dueDate);
      if (days <= 0) tasksDue.immediately++;
      else if (days <= 7) tasksDue.thisWeek++;
      else if (days <= 14) tasksDue.nextWeek++;
      else if (days <= 28) tasksDue.inTwoWeeks++;
    }

    return successResponse({
      completedVisits:     { ...cvBuckets, total: cvTotal, percent: cvPercent },
      plannedVisits:       { ...pvBuckets, total: pvTotal, percent: pvPercent },
      iqaActions:          { count: iqaCount },
      learnersDue90:       learnersDue.slice(0, 10),
      learnersLoggedIn:    loggedInBuckets,
      learnersOnTarget:    targetBuckets,
      learnersOnTargetOTJ: otjBuckets,
      noOTJActivity:       noOtjBuckets,
      progressReviewDue:   prDue,
      tasksDue,
    });
  }

  // ── Reports ───────────────────────────────────────────────────────────────

  async getReport(
    type: string,
    dto: ReportParamsDto,
    currentUser: IAuthUser,
  ) {
    const trainerId = new Types.ObjectId(currentUser._id);
    const page = Math.max(1, parseInt(String(dto.page ?? 1), 10) || 1);
    const limit = Math.max(1, parseInt(String(dto.limit ?? 10), 10) || 10);

    const learnerFilter: any = {
      trainerId,
      role: UserRole.LEARNER,
      status: { $ne: UserStatus.DELETED },
    };
    if (dto.cohort) learnerFilter.cohort = dto.cohort;
    if (dto.programme) learnerFilter.programme = dto.programme;

    switch (type) {
      case 'learners-last-logged-in': {
        const [data, total] = await Promise.all([
          this.userModel
            .find(learnerFilter, { passwordHash: 0 })
            .sort({ lastActivityAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
          this.userModel.countDocuments(learnerFilter),
        ]);
        return paginatedResponse(data, total, page, limit);
      }

      case 'progress-reviews-due': {
        // Return learners who have pending/in-progress tasks closest to due
        const learnerIds = await this.getMyLearnerIds(currentUser._id);
        const taskFilter: any = {
          $or: learnerIds.flatMap((id) => [
            { assignedTo: id },
            { createdBy: id },
          ]),
          isDeleted: false,
          status: { $in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] },
          dueDate: { $ne: null },
        };
        if (dto.from) taskFilter.dueDate = { ...taskFilter.dueDate, $gte: new Date(dto.from) };
        if (dto.to) taskFilter.dueDate = { ...taskFilter.dueDate, $lte: new Date(dto.to) };

        const [data, total] = await Promise.all([
          this.taskModel
            .find(taskFilter)
            .populate('assignedTo', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName email')
            .sort({ dueDate: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
          this.taskModel.countDocuments(taskFilter),
        ]);
        return paginatedResponse(data, total, page, limit);
      }

      case 'due-to-complete': {
        const learnerIds = await this.getMyLearnerIds(currentUser._id);
        const now = new Date();
        const taskFilter: any = {
          $or: learnerIds.flatMap((id) => [
            { assignedTo: id },
            { createdBy: id },
          ]),
          isDeleted: false,
          status: { $ne: TaskStatus.COMPLETED },
          dueDate: { $lte: now },
        };
        const [data, total] = await Promise.all([
          this.taskModel
            .find(taskFilter)
            .populate('assignedTo', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName email')
            .sort({ dueDate: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
          this.taskModel.countDocuments(taskFilter),
        ]);
        return paginatedResponse(data, total, page, limit);
      }

      default:
        throw new BadRequestException(`Unknown report type: ${type}`);
    }
  }

  // ── Trainer-scoped Tasks ──────────────────────────────────────────────────

  async getMyTasks(
    page: number = 1,
    limit: number = 20,
    status: string | undefined,
    currentUser: IAuthUser,
  ) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, parseInt(String(limit), 10) || 20);

    const learnerIds = await this.getMyLearnerIds(currentUser._id);
    const trainerId = new Types.ObjectId(currentUser._id);

    // Show tasks assigned to or created by the trainer's learners, OR assigned to the trainer
    const ownerIds = [trainerId, ...learnerIds];

    const filterQuery: any = {
      $or: ownerIds.flatMap((id) => [
        { assignedTo: id },
        { createdBy: id },
      ]),
      isDeleted: false,
    };

    if (status) {
      filterQuery.status = status;
    }

    const [data, total] = await Promise.all([
      this.taskModel
        .find(filterQuery)
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((p - 1) * l)
        .limit(l)
        .lean(),
      this.taskModel.countDocuments(filterQuery),
    ]);

    return paginatedResponse(data, total, p, l);
  }
}