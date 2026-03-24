import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignExitReviewDto {
  @ApiProperty({ enum: ['learner', 'trainer'], description: 'Which party is signing' })
  @IsIn(['learner', 'trainer'])
  role: 'learner' | 'trainer';
}
