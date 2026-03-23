import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '../../../database/repositories/base/abstract.repository';
import { FeedbackComment } from '../schemas/feedback-comment.schema';

@Injectable()
export class FeedbackCommentRepository extends AbstractRepository<FeedbackComment> {
  protected readonly logger = new Logger(FeedbackCommentRepository.name);

  constructor(
    @InjectModel(FeedbackComment.name) private readonly model_: Model<FeedbackComment>,
    @InjectConnection() connection: Connection,
  ) {
    super(model_, connection);
  }

  async softDelete(id: string): Promise<void> {
    await this.model_.findByIdAndUpdate(id, { $set: { isDeleted: true } });
  }

  async findByActivity(activityId: string): Promise<FeedbackComment[]> {
    return this.model_.find({ learningActivityId: activityId, isDeleted: false }).lean().exec() as any;
  }
}
