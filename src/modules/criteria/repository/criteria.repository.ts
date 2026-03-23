import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '../../../database/repositories/base/abstract.repository';
import { Criteria } from '../schemas/criteria.schema';

@Injectable()
export class CriteriaRepository extends AbstractRepository<Criteria> {
  protected readonly logger = new Logger(CriteriaRepository.name);

  constructor(
    @InjectModel(Criteria.name) private readonly criteriaModel: Model<Criteria>,
    @InjectConnection() connection: Connection,
  ) {
    super(criteriaModel, connection);
  }

  async findActive(): Promise<Criteria[]> {
    return this.criteriaModel.find({ isActive: true }).sort({ code: 1 }).lean().exec() as any;
  }
}
