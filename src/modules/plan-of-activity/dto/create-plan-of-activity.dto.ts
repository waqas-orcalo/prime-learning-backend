import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SessionStatus } from '../../../common/constants/enums.constant';

export class TrainingSessionDto {
  @IsNumber()
  sessionNumber: number;

  @IsDateString()
  date: string;

  @IsString()
  topic: string;

  @IsEnum(SessionStatus)
  status: SessionStatus;

  @IsOptional()
  @IsString()
  trainerNotes?: string;
}

export class CreatePlanOfActivityDto {
  @ApiProperty({ example: '64f1a2b3c4d5e6f7a8b9c0d1' })
  @IsString()
  learnerId: string;

  @ApiProperty({ example: 'Level 3 Adult Care' })
  @IsString()
  programmeTitle: string;

  @ApiPropertyOptional({ example: 'AC-L3-2025' })
  @IsOptional()
  @IsString()
  programmeCode?: string;

  @ApiProperty({ example: '2025-01-06' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  expectedEndDate: string;

  @ApiPropertyOptional({ type: [TrainingSessionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingSessionDto)
  trainingSessions?: TrainingSessionDto[];
}
