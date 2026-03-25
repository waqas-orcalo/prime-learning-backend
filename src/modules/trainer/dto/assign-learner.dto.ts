import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class AssignLearnerDto {
  @ApiProperty({ description: 'ID of the learner to assign to this trainer' })
  @IsString()
  learnerId: string;

  @ApiPropertyOptional({ description: 'Cohort label', example: 'Cohort 2025-Q1' })
  @IsOptional()
  @IsString()
  cohort?: string;

  @ApiPropertyOptional({ description: 'Programme name', example: 'Level 3 Business Admin' })
  @IsOptional()
  @IsString()
  programme?: string;

  @ApiPropertyOptional({ description: 'Employer name', example: 'Acme Corp' })
  @IsOptional()
  @IsString()
  employer?: string;
}
