import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { AbstractRepository } from '../../../database/repositories/base/abstract.repository';
import { ActivityCriteria } from '../schemas/activity-criteria.schema';

@Injectable()
export class ActivityCriteriaRepository extends AbstractRepository<ActivityCriteria> {
  protected readonly logger = new Logger(ActivityCriteriaRepository.name);

  constructor(
    @InjectModel(ActivityCriteria.name) private readonly acModel: Model<ActivityCriteria>,
    @InjectConnection() connection: Connection,
  ) {
    super(acModel, connection);
  }

  async findByActivity(activityId: string): Promise<ActivityCriteria[]> {
    return this.acModel.aggregate([
      { $match: { learningActivityId: new Types.ObjectId(activityId), isDeleted: false } },
      { $lookup: { from: 'criteria', localField: 'criteriaId', foreignField: '_id', as: 'criteria' } },
      { $unwind: { path: '$criteria', preserveNullAndEmptyArrays: true } },
    ]);
  }

  async removeByActivity(activityId: string): Promise<void> {
    await this.acModel.deleteMany({ learningActivityId: new Types.ObjectId(activityId) });
  }
}
