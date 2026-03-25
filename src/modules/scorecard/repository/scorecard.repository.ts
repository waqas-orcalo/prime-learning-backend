import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../../database/repositories/base/abstract.repository';
import { Scorecard } from '../schemas/scorecard.schema';

@Injectable()
export class ScorecardRepository extends AbstractRepository<Scorecard> {
  protected readonly logger = new Logger(ScorecardRepository.name);

  constructor(
    @InjectModel(Scorecard.name) model: Model<Scorecard>,
    @InjectConnection() connection: Connection,
  ) {
    super(model, connection);
  }
}
