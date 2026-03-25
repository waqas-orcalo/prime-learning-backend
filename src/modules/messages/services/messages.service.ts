import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MessageRepository } from '../repository/message.repository';
import { SendMessageDto } from '../dto/send-message.dto';
import { SseService } from './sse.service';
import { User } from '../../users/schemas/user.schema';
import { Message } from '../schemas/message.schema';
import {
  paginatedResponse,
  ResponseMessage,
  successResponse,
} from '../../../common/constants/responses.constant';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { UserRole, UserStatus } from '../../../common/constants/enums.constant';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly sseService: SseService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) {}

  // ── Send message ────────────────────────────────────────────────────────────
  async send(dto: SendMessageDto, currentUser: IAuthUser) {
    const message = await this.messageRepository.create({
      senderId: new Types.ObjectId(currentUser._id),
      recipientId: new Types.ObjectId(dto.recipientId),
      content: dto.content,
    } as any);

    const messageId = String((message as any)._id);

    // Push real-time event to recipient via SSE
    // All IDs are plain strings so the frontend can compare them directly
    this.sseService.emit(dto.recipientId, {
      type: 'new-message',
      data: {
        _id: messageId,
        senderId: String(currentUser._id),
        recipientId: dto.recipientId,
        content: dto.content,
        createdAt: new Date().toISOString(),
        isRead: false,
      },
    });

    // Return message with string _id so optimistic-update === comparison works
    return successResponse(
      { ...(message as any), _id: messageId, senderId: String(currentUser._id) },
      ResponseMessage.CREATED,
      201,
    );
  }

  // ── Get paginated conversation between two users ────────────────────────────
  async getConversation(
    otherUserId: string,
    page = 1,
    limit = 20,
    currentUser: IAuthUser,
  ) {
    const { data, total } = await this.messageRepository.findConversation(
      currentUser._id,
      otherUserId,
      page,
      limit,
    );

    // Mark messages from the other user as read
    await this.messageRepository.markConversationRead(
      otherUserId,
      currentUser._id,
    );

    return paginatedResponse(data, total, page, limit);
  }

  // ── Get conversation list (sidebar) ────────────────────────────────────────
  // Uses plain Node.js logic instead of MongoDB aggregation $cond to avoid
  // ObjectId comparison quirks that produce wrong partnerId values.
  async getConversationsList(currentUser: IAuthUser) {
    const myId = String(currentUser._id);
    const uid = new Types.ObjectId(myId);

    // Get all distinct partner IDs via two simple filter queries (no $cond)
    const [sentToIds, receivedFromIds] = await Promise.all([
      this.messageModel.distinct('recipientId', { senderId: uid, isDeleted: false }),
      this.messageModel.distinct('senderId', { recipientId: uid, isDeleted: false }),
    ]);

    const partnerIds = [
      ...new Set([...sentToIds, ...receivedFromIds].map((id) => String(id))),
    ];

    if (!partnerIds.length) return successResponse([]);

    const results = await Promise.all(
      partnerIds.map(async (partnerId) => {
        const partnerObjId = new Types.ObjectId(partnerId);
        const [lastMsg, unreadCount, partner] = await Promise.all([
          this.messageModel
            .findOne({
              isDeleted: false,
              $or: [
                { senderId: uid, recipientId: partnerObjId },
                { senderId: partnerObjId, recipientId: uid },
              ],
            })
            .sort({ createdAt: -1 })
            .lean(),
          this.messageModel.countDocuments({
            senderId: partnerObjId,
            recipientId: uid,
            isRead: false,
            isDeleted: false,
          }),
          this.userModel
            .findById(partnerObjId)
            .select('firstName lastName email')
            .lean(),
        ]);

        if (!lastMsg || !partner) return null;

        return {
          partnerId,
          firstName: (partner as any).firstName,
          lastName: (partner as any).lastName,
          email: (partner as any).email,
          lastMessage: (lastMsg as any).content,
          lastMessageAt: (lastMsg as any).createdAt,
          lastMessageMine: String((lastMsg as any).senderId) === myId,
          unreadCount,
        };
      }),
    );

    const conversations = results
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date((b as any).lastMessageAt).getTime() -
          new Date((a as any).lastMessageAt).getTime(),
      );

    return successResponse(conversations);
  }

  // ── Get users NOT yet in the current user's conversations ──────────────────
  async getAvailableContacts(currentUser: IAuthUser, search?: string) {
    const partnerIds = await this.messageRepository.findConversationPartnerIds(
      currentUser._id,
    );

    const excludedIds = [
      ...partnerIds,
      new Types.ObjectId(currentUser._id),
    ];

    const filter: Record<string, unknown> = {
      _id: { $nin: excludedIds },
      // Only show active users — schema uses `status`, not `isActive`
      status: { $nin: [UserStatus.BLOCKED, UserStatus.INACTIVE, UserStatus.DELETED] },
    };

    // Trainers can only start conversations with their assigned learners
    if (currentUser.role === UserRole.TRAINER) {
      const trainerObjId = new Types.ObjectId(currentUser._id);
      filter.$or = [
        { trainerId: trainerObjId },
        { assignedTrainerId: trainerObjId },
      ] as any;
      // Keep only learners
      filter.role = UserRole.LEARNER;
    }

    if (search) {
      const regex = { $regex: search, $options: 'i' };
      const searchOr = [{ firstName: regex }, { lastName: regex }, { email: regex }];
      // Merge with existing $or if present (trainer case) — wrap in $and
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchOr }] as any;
        delete filter.$or;
      } else {
        filter.$or = searchOr as any;
      }
    }

    const users = await this.userModel
      .find(filter)
      .select('_id firstName lastName email role')
      .limit(50)
      .lean()
      .exec();

    // Cast _id ObjectId → plain string for safe frontend === comparisons
    const safeUsers = (users as any[]).map((u) => ({
      ...u,
      _id: String(u._id),
    }));

    return successResponse(safeUsers);
  }

  // ── Unread count ────────────────────────────────────────────────────────────
  async getUnreadCount(currentUser: IAuthUser) {
    const count = await this.messageRepository.countUnread(currentUser._id);
    return successResponse({ unreadCount: count });
  }

  // ── Soft delete ────────────────────────────────────────────────────────────
  async deleteMessage(id: string) {
    await this.messageRepository.softDelete(id);
    return successResponse(null, ResponseMessage.DELETED);
  }
}
