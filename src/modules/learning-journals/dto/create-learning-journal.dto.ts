import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { JournalPrivacy } from '../../../common/constants/enums.constant';

export class CreateLearningJournalDto {
  @ApiPropertyOptional({ description: 'Learning activity this journal relates to' })
  @IsOptional()
  @IsString()
  learningActivityId?: string;

  @ApiProperty({ example: 'Development task 1' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'Competition' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: '2024-12-27' })
  @IsString()
  date: string;

  @ApiPropertyOptional({ example: '10' })
  @IsOptional()
  @IsString()
  timeHH?: string;

  @ApiPropertyOptional({ example: '22' })
  @IsOptional()
  @IsString()
  timeMM?: string;

  @ApiPropertyOptional({ enum: ['AM', 'PM'], example: 'AM' })
  @IsOptional()
  @IsEnum(['AM', 'PM'])
  amPm?: string;

  @ApiPropertyOptional({ example: '02' })
  @IsOptional()
  @IsString()
  durationHH?: string;

  @ApiPropertyOptional({ example: '30' })
  @IsOptional()
  @IsString()
  durationMM?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  offJob?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  onJob?: boolean;

  @ApiPropertyOptional({ example: 'Completed the initial development tasks.' })
  @IsOptional()
  @IsString()
  reflection?: string;

  @ApiPropertyOptional({ enum: JournalPrivacy, default: JournalPrivacy.ONLY_ME })
  @IsOptional()
  @IsEnum(JournalPrivacy)
  privacy?: JournalPrivacy;

  @ApiPropertyOptional({ type: [String], example: [] })
  @IsOptional()
  @IsString({ each: true })
  files?: string[];
}
