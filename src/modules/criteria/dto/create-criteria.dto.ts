import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { CriteriaType } from '../../../common/constants/enums.constant';

export class CreateCriteriaDto {
  @ApiProperty({ example: 'K1' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Understanding the business context' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: CriteriaType })
  @IsOptional()
  @IsEnum(CriteriaType)
  type?: CriteriaType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
