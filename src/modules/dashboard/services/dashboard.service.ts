import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { UserRole, UserStatus, TaskStatus } from '../../../common/constants/enums.constant';
import { successResponse } from '../../../common/constants/responses.constant';
import { Task } from '../../tasks/schemas/task.schema';
import { LearningActivity } from '../../learning-activities/schemas/learning-activity.schema';
import { Message } from '../../messages/schemas/message.schema';
import { User } from '../../users/schemas/user.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel(LearningActivity.name)
    private readonly activityModel: Model<LearningActivity>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  /** Get IDs of learners assigned to this trainer */
  private async getLearnerIdsForTrainer(
    trainerId: Types.ObjectId,
  ): Promise<Types.ObjectId[]> {
    const learners = await this.userModel
      .find(
        {
          trainerId,
          role: UserRole.LEARNER,
          status: { $ne: UserStatus.DELETED },
        },
        { _id: 1 },
      )
      .lean();
    return learners.map((l) => l._id as Types.ObjectId);
  }

  async getStats(currentUser: IAuthUser) {
    const userId = new Types.ObjectId(currentUser._id);

    const isLearner = currentUser.role === UserRole.LEARNER;
    const isTrainer = currentUser.role === UserRole.TRAINER;

    // Pre-compute filters based on role
    let taskFilter: any;
    let activityFilter: any;

    if (isLearner) {
      taskFilter = { createdBy: userId, isDeleted: false };
      activityFilter = { createdBy: userId, isDeleted: false };
    } else if (isTrainer) {
      const learnerIds = await this.getLearnerIdsForTrainer(userId);
      if (learnerIds.length > 0) {
        taskFilter = {
          $or: learnerIds.flatMap((id) => [
            { assignedTo: id },
            { createdBy: id },
          ]),
          isDeleted: false,
        };
        activityFilter = { createdBy: { $in: learnerIds }, isDeleted: false };
      } else {
        taskFilter = { _id: null, isDeleted: false };
        activityFilter = { _id: null, isDeleted: false };
      }
    } else {
      taskFilter = { isDeleted: false };
      activityFilter = { isDeleted: false };
    }

    // Run all counts in parallel
    const [
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      totalActivities,
      unreadMessages,
    ] = await Promise.all([
      this.taskModel.countDocuments(taskFilter),
      this.taskModel.countDocuments({ ...taskFilter, status: TaskStatus.PENDING }),
      this.taskModel.countDocuments({
        ...taskFilter,
        status: TaskStatus.IN_PROGRESS,
      }),
      this.taskModel.countDocuments({
        ...taskFilter,
        status: TaskStatus.COMPLETED,
      }),
      this.activityModel.countDocuments(activityFilter),
      this.messageModel.countDocuments({
        recipientId: userId,
        isRead: false,
        isDeleted: false,
      }),
    ]);

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return successResponse({
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        completionRate,
      },
      activities: {
        total: totalActivities,
      },
      messages: {
        unread: unreadMessages,
      },
    });
  }

  async getRecentActivity(currentUser: IAuthUser) {
    const userId = new Types.ObjectId(currentUser._id);
    const isLearner = currentUser.role === UserRole.LEARNER;
    const isTrainer = currentUser.role === UserRole.TRAINER;

    let taskFilter: any;
    let activityFilter: any;

    if (isLearner) {
      taskFilter = { createdBy: userId, isDeleted: false };
      activityFilter = { createdBy: userId, isDeleted: false };
    } else if (isTrainer) {
      const learnerIds = await this.getLearnerIdsForTrainer(userId);
      if (learnerIds.length > 0) {
        taskFilter = {
          $or: learnerIds.flatMap((id) => [
            { assignedTo: id },
            { createdBy: id },
          ]),
          isDeleted: false,
        };
        activityFilter = { createdBy: { $in: learnerIds }, isDeleted: false };
      } else {
        taskFilter = { _id: null, isDeleted: false };
        activityFilter = { _id: null, isDeleted: false };
      }
    } else {
      taskFilter = { isDeleted: false };
      activityFilter = { isDeleted: false };
    }

    const [recentTasks, recentActivities] = await Promise.all([
      this.taskModel
        .find(taskFilter)
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),
      this.activityModel
        .find(activityFilter)
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return successResponse({ recentTasks, recentActivities });
  }
}
