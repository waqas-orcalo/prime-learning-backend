import {
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExitReviewDto {
  @ApiProperty({ description: 'MongoDB ObjectId of the learner' })
  @IsMongoId()
  learnerId: string;

  @ApiPropertyOptional({ description: 'MongoDB ObjectId of the trainer' })
  @IsOptional()
  @IsMongoId()
  trainerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  learnersName?: string;

  @ApiPropertyOptional({ description: 'ISO date string for programme start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Programme Evaluation answers keyed as pe_0_0 … pe_4_1',
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  @IsOptional()
  @IsObject()
  answers?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Answer for the final standalone question' })
  @IsOptional()
  @IsString()
  answerLast?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  learnerSigned?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  trainerSigned?: boolean;
}
