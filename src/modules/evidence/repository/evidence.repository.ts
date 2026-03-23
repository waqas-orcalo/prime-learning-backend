import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '../../../database/repositories/base/abstract.repository';
import { Evidence } from '../schemas/evidence.schema';

@Injectable()
export class EvidenceRepository extends AbstractRepository<Evidence> {
  protected readonly logger = new Logger(EvidenceRepository.name);

  constructor(
    @InjectModel(Evidence.name) private readonly evidenceModel: Model<Evidence>,
    @InjectConnection() connection: Connection,
  ) {
    super(evidenceModel, connection);
  }

  async softDelete(id: string): Promise<void> {
    await this.evidenceModel.findByIdAndUpdate(id, { $set: { isDeleted: true } });
  }

  async findByActivity(activityId: string): Promise<Evidence[]> {
    return this.evidenceModel
      .find({ learningActivityId: activityId, isDeleted: false })
      .lean()
      .exec() as any;
  }
}
