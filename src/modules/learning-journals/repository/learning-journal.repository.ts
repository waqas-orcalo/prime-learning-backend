import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '../../../database/repositories/base/abstract.repository';
import { LearningJournal } from '../schemas/learning-journal.schema';

@Injectable()
export class LearningJournalRepository extends AbstractRepository<LearningJournal> {
  protected readonly logger = new Logger(LearningJournalRepository.name);

  constructor(
    @InjectModel(LearningJournal.name)
    private readonly learningJournalModel: Model<LearningJournal>,
    @InjectConnection() connection: Connection,
  ) {
    super(learningJournalModel, connection);
  }

  async softDelete(id: string): Promise<void> {
    await this.learningJournalModel.findByIdAndUpdate(id, {
      $set: { isDeleted: true },
    });
  }

  async findByUser(userId: string): Promise<LearningJournal[]> {
    return this.learningJournalModel
      .find({ createdBy: userId, isDeleted: false })
      .sort({ createdAt: -1 })
      .lean()
      .exec() as any;
  }
}
