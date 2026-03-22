import { Injectable, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { LearningActivityRepository } from '../repository/learning-activity.repository';
import { CreateLearningActivityDto } from '../dto/create-learning-activity.dto';
import { UpdateLearningActivityDto } from '../dto/update-learning-activity.dto';
import {
  paginatedResponse,
  ResponseMessage,
  successResponse,
} from '../../../common/constants/responses.constant';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { TaskStatus, UserRole } from '../../../common/constants/enums.constant';

@Injectable()
export class LearningActivitiesService {
  constructor(
    private readonly activityRepository: LearningActivityRepository,
  ) {}

  async create(dto: CreateLearningActivityDto, currentUser: IAuthUser) {
    const activity = await this.activityRepository.create({
      ...dto,
      createdBy: new Types.ObjectId(currentUser._id),
      assignedTo: dto.assignedTo
        ? new Types.ObjectId(dto.assignedTo)
        : undefined,
    } as any);
    return successResponse(activity, ResponseMessage.CREATED, 201);
  }

  async findAll(page = 1, limit = 10, currentUser: IAuthUser) {
    const filterQuery =
      currentUser.role === UserRole.LEARNER
        ? { createdBy: new Types.ObjectId(currentUser._id), isDeleted: false }
        : { isDeleted: false };

    const { data, total, pages } = await this.activityRepository.paginate({
      filterQuery: filterQuery as any,
      page,
      limit,
    });
    return paginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const activity = await this.activityRepository.findById(id);
    return successResponse(activity);
  }

  async update(
    id: string,
    dto: UpdateLearningActivityDto,
    currentUser: IAuthUser,
  ) {
    const activity = await this.activityRepository.findById(id);

    if (
      currentUser.role === UserRole.LEARNER &&
      String((activity as any).createdBy) !== currentUser._id
    ) {
      throw new ForbiddenException(
        'You can only update your own learning activities.',
      );
    }

    const updated = await this.activityRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(id) } as any,
      { $set: dto },
    );
    return successResponse(updated, ResponseMessage.UPDATED);
  }

  async updateStatus(id: string, status: TaskStatus, currentUser: IAuthUser) {
    const updated = await this.activityRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(id) } as any,
      { $set: { status } },
    );
    return successResponse(updated, ResponseMessage.UPDATED);
  }

  async remove(id: string) {
    await this.activityRepository.softDelete(id);
    return successResponse(null, ResponseMessage.DELETED);
  }
}
