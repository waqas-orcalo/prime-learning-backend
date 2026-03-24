import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { NotificationRepository } from '../repository/notification.repository';
import { NotificationType } from '../schemas/notification.schema';
import { successResponse } from '../../../common/constants/responses.constant';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  /** Create a single notification for a user */
  async createOne(userId: string, type: NotificationType, title: string, message: string) {
    return this.notificationRepository.create({
      userId: new Types.ObjectId(userId),
      type,
      title,
      message,
      read: false,
    } as any);
  }

  /** Create notifications for multiple users at once */
  async createForMany(userIds: string[], type: NotificationType, title: string, message: string) {
    for (const userId of userIds) {
      await this.createOne(userId, type, title, message);
    }
  }

  /** Get all notifications for the current user (unread first, newest first) */
  async findAllForUser(currentUser: IAuthUser) {
    const notifications = await this.notificationRepository.find(
      { userId: new Types.ObjectId(currentUser._id), isDeleted: false } as any,
      undefined,
      { sort: { read: 1, createdAt: -1 }, limit: 50 } as any,
    );
    const unreadCount = notifications.filter((n: any) => !n.read).length;
    return successResponse({ notifications, unreadCount });
  }

  /** Mark a single notification as read */
  async markRead(id: string, currentUser: IAuthUser) {
    const updated = await this.notificationRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(currentUser._id) } as any,
      { $set: { read: true } },
    );
    return successResponse(updated, 'Marked as read');
  }

  /** Mark all notifications as read for the current user */
  async markAllRead(currentUser: IAuthUser) {
    await this.notificationRepository.updateMany(
      { userId: new Types.ObjectId(currentUser._id), read: false, isDeleted: false } as any,
      { $set: { read: true } },
    );
    return successResponse(null, 'All marked as read');
  }
}
