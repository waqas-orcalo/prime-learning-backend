import { IsBoolean, IsIn, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const YN = ['Yes/True', 'No/False'] as const;

export class CreateLearningSupportDto {
  @ApiProperty({ description: 'MongoDB ObjectId of the learner' })
  @IsMongoId()
  learnerId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  trainerId?: string;

  // ── Section 1 ────────────────────────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  attachmentName?: string;

  // ── Section 2 ────────────────────────────────────────────────────────────────
  @ApiPropertyOptional({ enum: YN })
  @IsOptional()
  @IsIn(YN)
  monthlyReview?: string;

  @ApiPropertyOptional({ enum: YN })
  @IsOptional()
  @IsIn(YN)
  threeMonthlyReview?: string;

  // ── Section 3 ────────────────────────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  changesNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  activityTracker?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reasonForStopping?: string;

  // ── Section 4 ────────────────────────────────────────────────────────────────
  @ApiPropertyOptional({ enum: YN })
  @IsOptional()
  @IsIn(YN)
  tutorConfirmationA?: string;

  @ApiPropertyOptional({ enum: YN })
  @IsOptional()
  @IsIn(YN)
  tutorConfirmationB?: string;

  // ── Section 5 ────────────────────────────────────────────────────────────────
  @ApiPropertyOptional({ enum: YN })
  @IsOptional()
  @IsIn(YN)
  learnerConfirmation?: string;

  // ── Signatures ───────────────────────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  learnerSigned?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  trainerSigned?: boolean;
}
