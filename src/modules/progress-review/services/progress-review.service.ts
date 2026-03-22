import { Injectable, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ProgressReviewRepository } from '../repository/progress-review.repository';
import { CreateProgressReviewDto } from '../dto/create-progress-review.dto';
import { UpdateProgressReviewDto } from '../dto/update-progress-review.dto';
import {
  paginatedResponse,
  ResponseMessage,
  successResponse,
} from '../../../common/constants/responses.constant';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { SignatureRole, UserRole } from '../../../common/constants/enums.constant';

@Injectable()
export class ProgressReviewService {
  constructor(
    private readonly progressReviewRepository: ProgressReviewRepository,
  ) {}

  async create(dto: CreateProgressReviewDto, currentUser: IAuthUser) {
    const review = await this.progressReviewRepository.create({
      ...dto,
      learnerId: new Types.ObjectId(dto.learnerId),
      trainerId: new Types.ObjectId(currentUser._id),
      completedUnits: (dto.completedUnits ?? []).map(
        (id) => new Types.ObjectId(id),
      ),
    } as any);
    return successResponse(review, ResponseMessage.CREATED, 201);
  }

  async findAll(page = 1, limit = 10, currentUser: IAuthUser) {
    const filterQuery =
      currentUser.role === UserRole.LEARNER
        ? { learnerId: new Types.ObjectId(currentUser._id), isDeleted: false }
        : { isDeleted: false };

    const { data, total } = await this.progressReviewRepository.paginate({
      filterQuery: filterQuery as any,
      page,
      limit,
    });
    return paginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const review = await this.progressReviewRepository.findById(id);
    return successResponse(review);
  }

  async update(
    id: string,
    dto: UpdateProgressReviewDto,
    currentUser: IAuthUser,
  ) {
    if (currentUser.role === UserRole.LEARNER) {
      throw new ForbiddenException('Learners cannot update progress reviews.');
    }

    const updated = await this.progressReviewRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(id) } as any,
      { $set: dto },
    );
    return successResponse(updated, ResponseMessage.UPDATED);
  }

  async addSignature(
    id: string,
    role: SignatureRole,
    signatureData: string,
    currentUser: IAuthUser,
  ) {
    const signature = {
      role,
      name: `${currentUser.firstName} ${currentUser.lastName}`,
      date: new Date(),
      signed: true,
      signatureData,
    };

    const updated = await this.progressReviewRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(id) } as any,
      { $push: { signatures: signature } } as any,
    );
    return successResponse(updated, ResponseMessage.UPDATED);
  }

  async remove(id: string) {
    await this.progressReviewRepository.softDelete(id);
    return successResponse(null, ResponseMessage.DELETED);
  }
}
