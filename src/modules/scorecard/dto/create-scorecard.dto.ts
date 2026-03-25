import { IsArray, IsOptional, IsString } from 'class-validator';

export class ScoreEntryDto {
  criterionKey: string;
  criterionLabel: string;
  section: string;
  subSection: string;
  previousScore: number;
  currentScore: number;
}

export class CreateScorecardDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  scores?: ScoreEntryDto[];
}
