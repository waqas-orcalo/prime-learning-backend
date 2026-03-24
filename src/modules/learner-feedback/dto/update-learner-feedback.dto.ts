import { PartialType } from '@nestjs/swagger';
import { CreateLearnerFeedbackDto } from './create-learner-feedback.dto';

export class UpdateLearnerFeedbackDto extends PartialType(CreateLearnerFeedbackDto) {}
