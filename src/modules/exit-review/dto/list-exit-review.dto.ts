import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListExitReviewDto {
  @ApiPropertyOptional({ description: 'Page number (default: 1)' })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page (default: 20, max: 100)' })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  learnerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  trainerId?: string;

  @ApiPropertyOptional({ description: 'ISO date string – filter from this date' })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'ISO date string – filter up to this date' })
  @IsOptional()
  @IsString()
  dateTo?: string;
}
