import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListMyLearnersDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by cohort' })
  @IsOptional()
  @IsString()
  cohort?: string;

  @ApiPropertyOptional({ description: 'Filter by programme' })
  @IsOptional()
  @IsString()
  programme?: string;

  @ApiPropertyOptional({ description: 'Filter by status: on-track | behind | at-risk' })
  @IsOptional()
  @IsString()
  status?: string;
}
