import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CriteriaRepository } from '../repository/criteria.repository';
import { ActivityCriteriaRepository } from '../repository/activity-criteria.repository';
import { CreateCriteriaDto } from '../dto/create-criteria.dto';
import { SetActivityCriteriaDto } from '../dto/set-activity-criteria.dto';
import { ResponseMessage, successResponse, paginatedResponse } from '../../../common/constants/responses.constant';

@Injectable()
export class CriteriaService {
  constructor(
    private readonly criteriaRepo: CriteriaRepository,
    private readonly activityCriteriaRepo: ActivityCriteriaRepository,
  ) {}

  // ── Master criteria ────────────────────────────────────────────────────────

  async create(dto: CreateCriteriaDto) {
    const item = await this.criteriaRepo.create(dto as any);
    return successResponse(item, ResponseMessage.CREATED, 201);
  }

  async findAll(page?: number, limit?: number) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.max(1, Number(limit) || 50);
    const { data, total } = await this.criteriaRepo.paginate({
      filterQuery: {} as any,
      page: safePage,
      limit: safeLimit,
      sortBy: 'code',
      sortOrder: 1,
    });
    return paginatedResponse(data, total, safePage, safeLimit);
  }

  async findOne(id: string) {
    return successResponse(await this.criteriaRepo.findById(id));
  }

  async update(id: string, dto: Partial<CreateCriteriaDto>) {
    const updated = await this.criteriaRepo.findOneAndUpdate(
      { _id: new Types.ObjectId(id) } as any,
      { $set: dto },
    );
    return successResponse(updated, ResponseMessage.UPDATED);
  }

  async remove(id: string) {
    await this.criteriaRepo.deleteOne({ _id: new Types.ObjectId(id) } as any);
    return successResponse(null, ResponseMessage.DELETED);
  }

  // ── Activity → Criteria mapping ────────────────────────────────────────────

  async getForActivity(activityId: string) {
    const items = await this.activityCriteriaRepo.findByActivity(activityId);
    return successResponse(items);
  }

  async setForActivity(activityId: string, dto: SetActivityCriteriaDto) {
    // Replace all criteria for this activity
    await this.activityCriteriaRepo.removeByActivity(activityId);

    const docs = dto.criteria.map(c => ({
      learningActivityId: new Types.ObjectId(activityId),
      criteriaId: new Types.ObjectId(c.criteriaId),
      evidence: c.evidence ?? '',
    }));

    if (docs.length > 0) {
      await this.activityCriteriaRepo.createMany(docs as any);
    }

    return successResponse(await this.activityCriteriaRepo.findByActivity(activityId), ResponseMessage.UPDATED);
  }
}
