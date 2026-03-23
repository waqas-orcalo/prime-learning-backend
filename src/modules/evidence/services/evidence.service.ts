import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { EvidenceRepository } from '../repository/evidence.repository';
import { CreateEvidenceDto } from '../dto/create-evidence.dto';
import { UpdateEvidenceDto } from '../dto/update-evidence.dto';
import {
  paginatedResponse,
  ResponseMessage,
  successResponse,
} from '../../../common/constants/responses.constant';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';

@Injectable()
export class EvidenceService {
  constructor(private readonly evidenceRepository: EvidenceRepository) {}

  async create(dto: CreateEvidenceDto, currentUser: IAuthUser) {
    const evidence = await this.evidenceRepository.create({
      ...dto,
      learningActivityId: new Types.ObjectId(dto.learningActivityId),
      createdBy: new Types.ObjectId(currentUser._id),
    } as any);
    return successResponse(evidence, ResponseMessage.CREATED, 201);
  }

  async findAll(page = 1, limit = 10) {
    const { data, total, pages } = await this.evidenceRepository.paginate({
      filterQuery: { isDeleted: false } as any,
      page,
      limit,
    });
    return paginatedResponse(data, total, page, limit);
  }

  async findByActivity(activityId: string) {
    const evidence = await this.evidenceRepository.findByActivity(activityId);
    return successResponse(evidence);
  }

  async findOne(id: string) {
    const evidence = await this.evidenceRepository.findById(id);
    return successResponse(evidence);
  }

  async update(id: string, dto: UpdateEvidenceDto) {
    const updated = await this.evidenceRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(id) } as any,
      { $set: dto },
    );
    return successResponse(updated, ResponseMessage.UPDATED);
  }

  async remove(id: string) {
    await this.evidenceRepository.softDelete(id);
    return successResponse(null, ResponseMessage.DELETED);
  }
}
