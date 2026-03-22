import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class KscItemDto {
  @IsString()
  unitCode: string;

  @IsString()
  description: string;

  @IsBoolean()
  achieved: boolean;
}

export class CreateProgressReviewDto {
  @ApiProperty({ example: '64f1a2b3c4d5e6f7a8b9c0d1' })
  @IsString()
  learnerId: string;

  @ApiProperty({ example: '2025-08-01' })
  @IsDateString()
  reviewDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [String], description: 'Completed unit IDs' })
  @IsOptional()
  @IsArray()
  completedUnits?: string[];

  @ApiPropertyOptional({ type: [KscItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KscItemDto)
  kscItems?: KscItemDto[];
}
