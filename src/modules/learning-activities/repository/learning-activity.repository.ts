import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '../../../database/repositories/base/abstract.repository';
import { LearningActivity } from '../schemas/learning-activity.schema';

@Injectable()
export class LearningActivityRepository extends AbstractRepository<LearningActivity> {
  protected readonly logger = new Logger(LearningActivityRepository.name);

  constructor(
    @InjectModel(LearningActivity.name)
    private readonly learningActivityModel: Model<LearningActivity>,
    @InjectConnection() connection: Connection,
  ) {
    super(learningActivityModel, connection);
  }

  async softDelete(id: string): Promise<void> {
    await this.learningActivityModel.findByIdAndUpdate(id, {
      $set: { isDeleted: true },
    });
  }

  async findByUser(userId: string): Promise<LearningActivity[]> {
    return this.learningActivityModel
      .find({ createdBy: userId, isDeleted: false })
      .lean()
      .exec() as any;
  }
}
