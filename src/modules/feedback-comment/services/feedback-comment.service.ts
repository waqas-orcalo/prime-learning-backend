import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { FeedbackCommentRepository } from '../repository/feedback-comment.repository';
import { CreateFeedbackCommentDto } from '../dto/create-feedback-comment.dto';
import { UpdateFeedbackCommentDto } from '../dto/update-feedback-comment.dto';
import { ResponseMessage, successResponse, paginatedResponse } from '../../../common/constants/responses.constant';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';

@Injectable()
export class FeedbackCommentService {
  constructor(private readonly repo: FeedbackCommentRepository) {}

  async create(dto: CreateFeedbackCommentDto, currentUser: IAuthUser) {
    const item = await this.repo.create({
      ...dto,
      learningActivityId: new Types.ObjectId(dto.learningActivityId),
      createdBy: new Types.ObjectId(currentUser._id),
    } as any);
    return successResponse(item, ResponseMessage.CREATED, 201);
  }

  async findByActivity(activityId: string) {
    const items = await this.repo.findByActivity(activityId);
    return successResponse(items);
  }

  async findOne(id: string) {
    return successResponse(await this.repo.findById(id));
  }

  async update(id: string, dto: UpdateFeedbackCommentDto) {
    const updated = await this.repo.findOneAndUpdate(
      { _id: new Types.ObjectId(id) } as any,
      { $set: dto },
    );
    return successResponse(updated, ResponseMessage.UPDATED);
  }

  async remove(id: string) {
    await this.repo.softDelete(id);
    return successResponse(null, ResponseMessage.DELETED);
  }
}
