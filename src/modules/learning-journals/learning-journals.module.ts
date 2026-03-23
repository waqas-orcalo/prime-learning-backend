import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  LearningJournal,
  LearningJournalSchema,
} from './schemas/learning-journal.schema';
import { LearningJournalRepository } from './repository/learning-journal.repository';
import { LearningJournalsService } from './services/learning-journals.service';
import { LearningJournalsController } from './controllers/learning-journals.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LearningJournal.name, schema: LearningJournalSchema },
    ]),
  ],
  controllers: [LearningJournalsController],
  providers: [LearningJournalsService, LearningJournalRepository],
  exports: [LearningJournalRepository],
})
export class LearningJournalsModule {}
