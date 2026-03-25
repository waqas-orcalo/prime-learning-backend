import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { ScoreEntryDto } from './create-scorecard.dto';

export class UpdateScorecardDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  scores?: ScoreEntryDto[];

  @IsOptional()
  @IsBoolean()
  submitted?: boolean;
}
