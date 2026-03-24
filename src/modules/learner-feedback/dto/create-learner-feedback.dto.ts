import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateLearnerFeedbackDto {
  @ApiPropertyOptional({ default: 'Learner feedback from teach sessions' })
  @IsOptional()
  @IsString()
  formName?: string;

  @ApiProperty({ description: 'MongoDB ObjectId of the learner' })
  @IsMongoId()
  learnerId: string;

  @ApiPropertyOptional({ description: 'MongoDB ObjectId of the trainer' })
  @IsOptional()
  @IsMongoId()
  trainerId?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() trainersName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() keyPoint?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() useSkillsImpact?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() moreInfoOn?: string;

  @ApiPropertyOptional({ enum: ['Yes', 'No', ''] })
  @IsOptional()
  @IsIn(['Yes', 'No', ''])
  completedJournal?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() ifNoWhyNot?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() improvementSuggestion?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() learnerSigned?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() trainerSigned?: boolean;
}
