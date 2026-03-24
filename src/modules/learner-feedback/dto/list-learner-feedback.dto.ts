import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class ListLearnerFeedbackDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by learner ID' })
  @IsOptional()
  @IsMongoId()
  learnerId?: string;

  @ApiPropertyOptional({ description: 'Filter by trainer ID' })
  @IsOptional()
  @IsMongoId()
  trainerId?: string;

  @ApiPropertyOptional({ description: 'Filter by date from (ISO string)' })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by date to (ISO string)' })
  @IsOptional()
  @IsString()
  dateTo?: string;
}
