import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  ActionRequiredBy,
  ActivityMethod,
  ActivityType,
  EvidenceRecording,
  TaskStatus,
} from '../../../common/constants/enums.constant';

export class CreateLearningActivityDto {
  @ApiPropertyOptional({ example: 'LA001' })
  @IsOptional()
  @IsString()
  ref?: string;

  @ApiProperty({ example: 'UI UX Design for Onefile' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ActivityMethod })
  @IsOptional()
  @IsEnum(ActivityMethod)
  method?: ActivityMethod;

  @ApiPropertyOptional({ enum: ActivityType })
  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ example: '2025-01-15' })
  @IsOptional()
  @IsString()
  activityDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  trainerTimeMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  learnerTimeMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  planOfActivityRef?: string;

  @ApiPropertyOptional({ enum: ActionRequiredBy })
  @IsOptional()
  @IsEnum(ActionRequiredBy)
  actionRequiredBy?: ActionRequiredBy;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  addToShowcase?: boolean;

  @ApiPropertyOptional({ enum: EvidenceRecording })
  @IsOptional()
  @IsEnum(EvidenceRecording)
  evidenceRecording?: EvidenceRecording;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  learnerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
