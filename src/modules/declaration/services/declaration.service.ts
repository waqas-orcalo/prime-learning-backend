import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { DeclarationRepository } from '../repository/declaration.repository';
import { UpsertDeclarationDto } from '../dto/upsert-declaration.dto';
import { ResponseMessage, successResponse } from '../../../common/constants/responses.constant';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';

@Injectable()
export class DeclarationService {
  constructor(private readonly repo: DeclarationRepository) {}

  async getByActivity(activityId: string) {
    const declaration = await this.repo.findByActivity(activityId);
    return successResponse(declaration);
  }

  async upsert(activityId: string, dto: UpsertDeclarationDto, currentUser: IAuthUser) {
    const now = new Date();
    const updateData: any = { ...dto };

    if (dto.learnerAgreed) updateData.learnerSignedAt = now;
    if (dto.trainerAgreed) updateData.trainerSignedAt = now;

    const declaration = await this.repo.upsertByActivity(
      activityId,
      { learningActivityId: new Types.ObjectId(activityId), ...updateData },
      new Types.ObjectId(currentUser._id),
    );
    return successResponse(declaration, ResponseMessage.UPDATED);
  }

  async sign(activityId: string, role: 'learner' | 'trainer', signature: string, currentUser: IAuthUser) {
    const updateData: any = role === 'learner'
      ? { learnerAgreed: true, learnerSignature: signature, learnerSignedAt: new Date() }
      : { trainerAgreed: true, trainerSignature: signature, trainerSignedAt: new Date() };

    const declaration = await this.repo.upsertByActivity(
      activityId,
      { learningActivityId: new Types.ObjectId(activityId), ...updateData },
      new Types.ObjectId(currentUser._id),
    );
    return successResponse(declaration, ResponseMessage.UPDATED);
  }
}
