import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class SignLearnerFeedbackDto {
  @ApiProperty({ enum: ['learner', 'trainer'], description: 'Which party is signing' })
  @IsIn(['learner', 'trainer'])
  role: 'learner' | 'trainer';
}
