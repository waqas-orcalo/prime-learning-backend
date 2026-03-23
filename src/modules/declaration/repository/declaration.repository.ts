import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { AbstractRepository } from '../../../database/repositories/base/abstract.repository';
import { Declaration } from '../schemas/declaration.schema';

@Injectable()
export class DeclarationRepository extends AbstractRepository<Declaration> {
  protected readonly logger = new Logger(DeclarationRepository.name);

  constructor(
    @InjectModel(Declaration.name) private readonly declarationModel: Model<Declaration>,
    @InjectConnection() connection: Connection,
  ) {
    super(declarationModel, connection);
  }

  async findByActivity(activityId: string): Promise<Declaration | null> {
    return this.declarationModel
      .findOne({ learningActivityId: new Types.ObjectId(activityId), isDeleted: false })
      .lean()
      .exec() as any;
  }

  async upsertByActivity(activityId: string, data: Partial<Declaration>, createdBy: Types.ObjectId): Promise<Declaration> {
    return this.declarationModel.findOneAndUpdate(
      { learningActivityId: new Types.ObjectId(activityId) },
      { $set: { ...data, createdBy } },
      { upsert: true, new: true, lean: true },
    ).exec() as any;
  }
}
