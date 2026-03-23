import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '../../../database/repositories/base/abstract.repository';
import { Visit } from '../schemas/visit.schema';

@Injectable()
export class VisitRepository extends AbstractRepository<Visit> {
  protected readonly logger = new Logger(VisitRepository.name);

  constructor(
    @InjectModel(Visit.name) private readonly visitModel: Model<Visit>,
    @InjectConnection() connection: Connection,
  ) {
    super(visitModel, connection);
  }

  async softDelete(id: string): Promise<void> {
    await this.visitModel.findByIdAndUpdate(id, {
      $set: { isDeleted: true },
    });
  }

  async findByLearner(learnerId: string): Promise<Visit[]> {
    return this.visitModel
      .find({ learnerId, isDeleted: false })
      .sort({ visitDate: -1 })
      .lean()
      .exec() as any;
  }

  async findByActivity(activityId: string): Promise<Visit[]> {
    return this.visitModel
      .find({ learningActivityId: activityId, isDeleted: false })
      .sort({ visitDate: -1 })
      .lean()
      .exec() as any;
  }

  async findAllVisits(learnerId?: string): Promise<Visit[]> {
    const filter: any = { isDeleted: false };
    if (learnerId) filter.learnerId = learnerId;
    return this.visitModel
      .find(filter)
      .sort({ visitDate: -1 })
      .lean()
      .exec() as any;
  }
}
