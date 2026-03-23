import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '../../../common/constants/enums.constant';

export class CreateTaskDto {
  @ApiProperty({ example: 'Complete Unit 01 assignment' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'Review and submit the assignment by Friday' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.PENDING })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ example: '2025-06-30' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'User ID to assign the task to' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ example: 'FSE1', description: 'Activity reference code' })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ example: 'Assignment', description: 'Primary assessment method' })
  @IsOptional()
  @IsString()
  primaryMethod?: string;

  @ApiPropertyOptional({ type: [String], example: ['Gateway', 'Observation'], description: 'Secondary assessment methods' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondaryMethods?: string[];

  @ApiPropertyOptional({ example: 'I completed the assignment by...', description: "Learner's evidence submission text" })
  @IsOptional()
  @IsString()
  evidence?: string;
}
