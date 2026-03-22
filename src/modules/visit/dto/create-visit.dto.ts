import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  TransportMode,
  VisitType,
} from '../../../common/constants/enums.constant';

export class CreateVisitDto {
  @ApiProperty({ enum: VisitType })
  @IsEnum(VisitType)
  visitType: VisitType;

  @ApiProperty({ example: '2025-07-01' })
  @IsDateString()
  visitDate: string;

  @ApiPropertyOptional({ example: 90 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  travelTimeMinutes?: number;

  @ApiPropertyOptional({ enum: TransportMode })
  @IsOptional()
  @IsEnum(TransportMode)
  transportMode?: TransportMode;

  @ApiPropertyOptional({ example: 'Learner is progressing well.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Learner ID this visit relates to' })
  @IsOptional()
  @IsString()
  learnerId?: string;
}
