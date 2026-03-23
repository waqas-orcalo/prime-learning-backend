import { PartialType } from '@nestjs/swagger';
import { CreateLearningJournalDto } from './create-learning-journal.dto';

export class UpdateLearningJournalDto extends PartialType(
  CreateLearningJournalDto,
) {}
