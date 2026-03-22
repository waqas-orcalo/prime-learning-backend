import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ActivityLogRepository } from '../repository/activity-log.repository';
import {
  ActivityLogAction,
  ActivityLogModule,
} from '../../../common/constants/enums.constant';
import {
  paginatedResponse,
  successResponse,
} from '../../../common/constants/responses.constant';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { UserRole } from '../../../common/constants/enums.constant';

export interface CreateActivityLogDto {
  performedBy: string;
  targetUser?: string;
  action: ActivityLogAction;
  module: ActivityLogModule;
  resourceId?: string;
  description?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class ActivityLogService {
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  async log(dto: CreateActivityLogDto): Promise<void> {
    await this.activityLogRepository.create({
      performedBy: new Types.ObjectId(dto.performedBy),
      targetUser: dto.targetUser
        ? new Types.ObjectId(dto.targetUser)
        : undefined,
      action: dto.action,
      module: dto.module,
      resourceId: dto.resourceId,
      description: dto.description,
      metadata: dto.metadata,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
    } as any);
  }

  async findAll(
    page = 1,
    limit = 20,
    currentUser: IAuthUser,
    userId?: string,
  ) {
    const p = Math.max(1, parseInt(String(page  ?? 1),  10) || 1);
    const l = Math.max(1, parseInt(String(limit ?? 20), 10) || 20);
    const filterQuery: Record<string, any> = {};

    if (currentUser.role === UserRole.LEARNER) {
      // Learners can only see their own activity
      filterQuery.performedBy = new Types.ObjectId(currentUser._id);
    } else if (userId) {
      filterQuery.performedBy = new Types.ObjectId(userId);
    }

    const { data, total } = await this.activityLogRepository.paginate({
      filterQuery: filterQuery as any,
      page: p,
      limit: l,
      pipelines: [
        {
          $lookup: {
            from: 'users',
            localField: 'performedBy',
            foreignField: '_id',
            as: 'performedByUser',
            pipeline: [{ $project: { firstName: 1, lastName: 1, email: 1, role: 1 } }],
          },
        },
        {
          $addFields: {
            performedBy: { $ifNull: [{ $arrayElemAt: ['$performedByUser', 0] }, '$performedBy'] },
          },
        },
        { $unset: 'performedByUser' },
      ],
    });
    return paginatedResponse(data, total, p, l);
  }

  async findOne(id: string) {
    const log = await this.activityLogRepository.findById(id);
    return successResponse(log);
  }
}
