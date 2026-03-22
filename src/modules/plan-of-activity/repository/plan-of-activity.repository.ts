import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '../../../database/repositories/base/abstract.repository';
import { PlanOfActivity } from '../schemas/plan-of-activity.schema';

@Injectable()
export class PlanOfActivityRepository extends AbstractRepository<PlanOfActivity> {
  protected readonly logger = new Logger(PlanOfActivityRepository.name);

  constructor(
    @InjectModel(PlanOfActivity.name)
    private readonly planModel: Model<PlanOfActivity>,
    @InjectConnection() connection: Connection,
  ) {
    super(planModel, connection);
  }

  async softDelete(id: string): Promise<void> {
    await this.planModel.findByIdAndUpdate(id, {
      $set: { isDeleted: true },
    });
  }

  async findByLearner(learnerId: string): Promise<PlanOfActivity[]> {
    return this.planModel
      .find({ learnerId, isDeleted: false })
      .sort({ createdAt: -1 })
      .lean()
      .exec() as any;
  }
}
