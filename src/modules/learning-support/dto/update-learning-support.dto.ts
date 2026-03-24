import { PartialType } from '@nestjs/swagger';
import { CreateLearningSupportDto } from './create-learning-support.dto';

export class UpdateLearningSupportDto extends PartialType(CreateLearningSupportDto) {}
