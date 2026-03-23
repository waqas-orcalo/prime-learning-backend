import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class ActivityCriteriaItemDto {
  @ApiProperty()
  @IsString()
  criteriaId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  evidence?: string;
}

export class SetActivityCriteriaDto {
  @ApiProperty({ type: [ActivityCriteriaItemDto] })
  @IsArray()
  criteria: ActivityCriteriaItemDto[];
}
