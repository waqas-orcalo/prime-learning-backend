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
import { TimesheetCategory } from '../../../common/constants/enums.constant';

export class CreateTimesheetEntryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  learningActivityId?: string;

  @ApiProperty({ enum: TimesheetCategory })
  @IsEnum(TimesheetCategory)
  category: TimesheetCategory;

  @ApiProperty({ example: '2025-01-07' })
  @IsDateString()
  dateFrom: string;

  @ApiProperty({ example: '2025-01-08' })
  @IsDateString()
  dateTo: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 120 })
  @IsNumber()
  @Min(1)
  timeMinutes: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  offJob?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  spentBy?: string;
}
