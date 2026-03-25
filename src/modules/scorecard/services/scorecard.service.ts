import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ScorecardRepository } from '../repository/scorecard.repository';
import { CreateScorecardDto } from '../dto/create-scorecard.dto';
import { UpdateScorecardDto } from '../dto/update-scorecard.dto';
import {
  paginatedResponse,
  ResponseMessage,
  successResponse,
} from '../../../common/constants/responses.constant';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { UserRole } from '../../../common/constants/enums.constant';

@Injectable()
export class ScorecardService {
  constructor(private readonly repo: ScorecardRepository) {}

  async create(dto: CreateScorecardDto, currentUser: IAuthUser) {
    // Auto-generate title if not provided
    const existingCount = await this.repo['model'].countDocuments({
      learnerId: new Types.ObjectId(currentUser._id),
      isDeleted: false,
    });

    const scorecard = await this.repo.create({
      learnerId: new Types.ObjectId(currentUser._id),
      title: dto.title || `Scorecard ${existingCount + 1}`,
      date: new Date(),
      submitted: false,
      scores: dto.scores ?? [],
      notes: dto.notes ?? '',
    } as any);

    return successResponse(scorecard, ResponseMessage.CREATED, 201);
  }

  async findAll(
    page = 1,
    limit = 20,
    dateFrom: string | undefined,
    currentUser: IAuthUser,
  ) {
    const filter: Record<string, any> = { isDeleted: false };

    // Learners see only their own; trainers/admins see all
    if (currentUser.role === UserRole.LEARNER) {
      filter.learnerId = new Types.ObjectId(currentUser._id);
    }

    if (dateFrom) {
      filter.date = { $gte: new Date(dateFrom) };
    }

    const { data, total } = await this.repo.paginate({
      filterQuery: filter,
      page,
      limit,
    });

    return paginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const sc = await this.repo.findById(id);
    return successResponse(sc);
  }

  async update(id: string, dto: UpdateScorecardDto) {
    const updated = await this.repo.findOneAndUpdate(
      { _id: new Types.ObjectId(id) } as any,
      { $set: dto },
    );
    return successResponse(updated, ResponseMessage.UPDATED);
  }

  async submit(id: string) {
    const updated = await this.repo.findOneAndUpdate(
      { _id: new Types.ObjectId(id) } as any,
      { $set: { submitted: true } },
    );
    return successResponse(updated, ResponseMessage.UPDATED);
  }

  async remove(id: string) {
    await this.repo.findOneAndUpdate(
      { _id: new Types.ObjectId(id) } as any,
      { $set: { isDeleted: true } },
    );
    return successResponse(null, ResponseMessage.DELETED);
  }
}
