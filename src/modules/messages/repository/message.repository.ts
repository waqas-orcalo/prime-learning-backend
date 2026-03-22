import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { AbstractRepository } from '../../../database/repositories/base/abstract.repository';
import { Message } from '../schemas/message.schema';

@Injectable()
export class MessageRepository extends AbstractRepository<Message> {
  protected readonly logger = new Logger(MessageRepository.name);

  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    @InjectConnection() connection: Connection,
  ) {
    super(messageModel, connection);
  }

  /** Get all messages between two users (newest first, all IDs as strings) */
  async findConversation(
    userAId: string,
    userBId: string,
    page: number,
    limit: number,
  ): Promise<{ data: any[]; total: number }> {
    const uA = new Types.ObjectId(userAId);
    const uB = new Types.ObjectId(userBId);
    const p = Number(page)  || 1;
    const l = Number(limit) || 20;

    const [result] = await this.messageModel.aggregate([
      {
        $match: {
          isDeleted: false,
          $or: [
            { senderId: uA, recipientId: uB },
            { senderId: uB, recipientId: uA },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: (p - 1) * l },
            { $limit: l },
            {
              // Cast ObjectIds → strings so frontend === comparisons work
              $project: {
                _id:         { $toString: '$_id' },
                senderId:    { $toString: '$senderId' },
                recipientId: { $toString: '$recipientId' },
                content:    1,
                isRead:     1,
                readAt:     1,
                createdAt:  1,
                updatedAt:  1,
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          data:  1,
          total: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
        },
      },
    ]);

    return { data: result?.data ?? [], total: result?.total ?? 0 };
  }

  /**
   * Get all unique conversations for a user.
   * All ObjectId fields are cast to strings so the frontend can compare them
   * directly with session user IDs (which are always plain strings).
   */
  async findConversations(userId: string) {
    const uid = new Types.ObjectId(userId);

    return this.messageModel.aggregate([
      {
        $match: {
          isDeleted: false,
          $or: [{ senderId: uid }, { recipientId: uid }],
        },
      },
      {
        // Use $setDifference to reliably extract the partner's ID:
        // removes the current user's ObjectId from [senderId, recipientId],
        // leaving only the partner. Avoids ObjectId $eq quirks in $cond.
        $addFields: {
          partnerId: {
            $arrayElemAt: [
              { $setDifference: [['$senderId', '$recipientId'], [uid]] },
              0,
            ],
          },
          isMine: { $eq: [{ $toString: '$senderId' }, userId] },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$partnerId',
          lastMessage: { $first: '$content' },
          lastMessageAt: { $first: '$createdAt' },
          lastMessageMine: { $first: '$isMine' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isMine', false] },
                    { $eq: ['$isRead', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastMessageAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'partner',
        },
      },
      { $unwind: '$partner' },
      {
        $project: {
          _id: 0,
          // Cast ObjectId → string so frontend === comparisons always work
          partnerId: { $toString: '$_id' },
          firstName: '$partner.firstName',
          lastName: '$partner.lastName',
          email: '$partner.email',
          lastMessage: 1,
          lastMessageAt: 1,
          lastMessageMine: 1,
          unreadCount: 1,
        },
      },
    ]);
  }

  /** Mark all unread messages from a sender as read */
  async markConversationRead(
    senderId: string,
    recipientId: string,
  ): Promise<void> {
    await this.messageModel.updateMany(
      {
        senderId: new Types.ObjectId(senderId),
        recipientId: new Types.ObjectId(recipientId),
        isRead: false,
      },
      { $set: { isRead: true, readAt: new Date() } },
    );
  }

  async countUnread(recipientId: string): Promise<number> {
    return this.messageModel.countDocuments({
      recipientId: new Types.ObjectId(recipientId),
      isRead: false,
      isDeleted: false,
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.messageModel.findByIdAndUpdate(id, {
      $set: { isDeleted: true },
    });
  }

  /** IDs of users who have ever messaged with this user */
  async findConversationPartnerIds(userId: string): Promise<Types.ObjectId[]> {
    const uid = new Types.ObjectId(userId);
    const result = await this.messageModel.aggregate<{ _id: Types.ObjectId }>([
      {
        $match: {
          isDeleted: false,
          $or: [{ senderId: uid }, { recipientId: uid }],
        },
      },
      {
        $addFields: {
          partnerId: {
            $arrayElemAt: [
              { $setDifference: [['$senderId', '$recipientId'], [uid]] },
              0,
            ],
          },
        },
      },
      { $group: { _id: '$partnerId' } },
    ]);
    return result.map((r) => r._id);
  }
}
