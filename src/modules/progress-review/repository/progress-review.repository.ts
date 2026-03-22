import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '../../../database/repositories/base/abstract.repository';
import { ProgressReview } from '../schemas/progress-review.schema';

@Injectable()
export class ProgressReviewRepository extends AbstractRepository<ProgressReview> {
  protected readonly logger = new Logger(ProgressReviewRepository.name);

  constructor(
    @InjectModel(ProgressReview.name)
    private readonly progressReviewModel: Model<ProgressReview>,
    @InjectConnection() connection: Connection,
  ) {
    super(progressReviewModel, connection);
  }

  async softDelete(id: string): Promise<void> {
    await this.progressReviewModel.findByIdAndUpdate(id, {
      $set: { isDeleted: true },
    });
  }

  async findByLearner(learnerId: string): Promise<ProgressReview[]> {
    return this.progressReviewModel
      .find({ learnerId, isDeleted: false })
      .sort({ reviewDate: -1 })
      .lean()
      .exec() as any;
  }
}
