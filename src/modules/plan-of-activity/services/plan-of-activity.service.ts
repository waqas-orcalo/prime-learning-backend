import { Injectable, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { PlanOfActivityRepository } from '../repository/plan-of-activity.repository';
import { CreatePlanOfActivityDto } from '../dto/create-plan-of-activity.dto';
import { UpdatePlanOfActivityDto } from '../dto/update-plan-of-activity.dto';
import {
  paginatedResponse,
  ResponseMessage,
  successResponse,
} from '../../../common/constants/responses.constant';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { UserRole } from '../../../common/constants/enums.constant';

@Injectable()
export class PlanOfActivityService {
  constructor(
    private readonly planRepository: PlanOfActivityRepository,
  ) {}

  async create(dto: CreatePlanOfActivityDto, currentUser: IAuthUser) {
    const plan = await this.planRepository.create({
      ...dto,
      learnerId: new Types.ObjectId(dto.learnerId),
      trainerId: new Types.ObjectId(currentUser._id),
    } as any);
    return successResponse(plan, ResponseMessage.CREATED, 201);
  }

  async findAll(page = 1, limit = 10, currentUser: IAuthUser) {
    const filterQuery =
      currentUser.role === UserRole.LEARNER
        ? { learnerId: new Types.ObjectId(currentUser._id), isDeleted: false }
        : { isDeleted: false };

    const { data, total } = await this.planRepository.paginate({
      filterQuery: filterQuery as any,
      page,
      limit,
    });
    return paginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const plan = await this.planRepository.findById(id);
    return successResponse(plan);
  }

  async update(
    id: string,
    dto: UpdatePlanOfActivityDto,
    currentUser: IAuthUser,
  ) {
    if (currentUser.role === UserRole.LEARNER) {
      throw new ForbiddenException('Learners cannot edit plans of activity.');
    }
    const updated = await this.planRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(id) } as any,
      { $set: dto },
    );
    return successResponse(updated, ResponseMessage.UPDATED);
  }

  async sign(
    id: string,
    role: 'learner' | 'trainer' | 'iqa',
  ) {
    const fieldMap: Record<string, object> = {
      learner: { learnerSigned: true, learnerSignedAt: new Date() },
      trainer: { trainerSigned: true, trainerSignedAt: new Date() },
      iqa: { iqaSigned: true, iqaSignedAt: new Date() },
    };
    const updated = await this.planRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(id) } as any,
      { $set: fieldMap[role] },
    );
    return successResponse(updated, ResponseMessage.UPDATED);
  }

  async remove(id: string) {
    await this.planRepository.softDelete(id);
    return successResponse(null, ResponseMessage.DELETED);
  }
}
