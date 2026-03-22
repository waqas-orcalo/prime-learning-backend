import { Injectable, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { VisitRepository } from '../repository/visit.repository';
import { CreateVisitDto } from '../dto/create-visit.dto';
import { UpdateVisitDto } from '../dto/update-visit.dto';
import {
  paginatedResponse,
  ResponseMessage,
  successResponse,
} from '../../../common/constants/responses.constant';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { UserRole } from '../../../common/constants/enums.constant';

@Injectable()
export class VisitService {
  constructor(private readonly visitRepository: VisitRepository) {}

  async create(dto: CreateVisitDto, currentUser: IAuthUser) {
    const visit = await this.visitRepository.create({
      ...dto,
      createdBy: new Types.ObjectId(currentUser._id),
      learnerId: dto.learnerId ? new Types.ObjectId(dto.learnerId) : undefined,
    } as any);
    return successResponse(visit, ResponseMessage.CREATED, 201);
  }

  async findAll(page = 1, limit = 10, currentUser: IAuthUser) {
    const filterQuery =
      currentUser.role === UserRole.LEARNER
        ? { learnerId: new Types.ObjectId(currentUser._id), isDeleted: false }
        : { isDeleted: false };

    const { data, total } = await this.visitRepository.paginate({
      filterQuery: filterQuery as any,
      page,
      limit,
    });
    return paginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const visit = await this.visitRepository.findById(id);
    return successResponse(visit);
  }

  async update(id: string, dto: UpdateVisitDto, currentUser: IAuthUser) {
    const visit = await this.visitRepository.findById(id);

    if (
      currentUser.role === UserRole.LEARNER &&
      String((visit as any).createdBy) !== currentUser._id
    ) {
      throw new ForbiddenException('You can only update your own visits.');
    }

    const updated = await this.visitRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(id) } as any,
      { $set: dto },
    );
    return successResponse(updated, ResponseMessage.UPDATED);
  }

  async addSignature(
    id: string,
    signatureType: 'learner' | 'trainer',
    signatureData: string,
  ) {
    const field =
      signatureType === 'learner' ? 'learnerSignature' : 'trainerSignature';
    const updated = await this.visitRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(id) } as any,
      { $set: { [field]: signatureData } },
    );
    return successResponse(updated, ResponseMessage.UPDATED);
  }

  async remove(id: string) {
    await this.visitRepository.softDelete(id);
    return successResponse(null, ResponseMessage.DELETED);
  }
}
