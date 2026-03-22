import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { UserRole, TaskStatus } from '../../../common/constants/enums.constant';
import { successResponse } from '../../../common/constants/responses.constant';
import { Task } from '../../tasks/schemas/task.schema';
import { LearningActivity } from '../../learning-activities/schemas/learning-activity.schema';
import { Message } from '../../messages/schemas/message.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel(LearningActivity.name)
    private readonly activityModel: Model<LearningActivity>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
  ) {}

  async getStats(currentUser: IAuthUser) {
    const userId = new Types.ObjectId(currentUser._id);

    const isLearner = currentUser.role === UserRole.LEARNER;
    const taskFilter = isLearner
      ? { createdBy: userId, isDeleted: false }
      : { isDeleted: false };

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
      this.activityModel.countDocuments(
        isLearner
          ? { createdBy: userId, isDeleted: false }
          : { isDeleted: false },
      ),
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

    const [recentTasks, recentActivities] = await Promise.all([
      this.taskModel
        .find(
          isLearner
            ? { createdBy: userId, isDeleted: false }
            : { isDeleted: false },
        )
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),
      this.activityModel
        .find(
          isLearner
            ? { createdBy: userId, isDeleted: false }
            : { isDeleted: false },
        )
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return successResponse({ recentTasks, recentActivities });
  }
}
