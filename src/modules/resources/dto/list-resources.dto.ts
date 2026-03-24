import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ResourceType, ResourceVisibility } from '../../../common/constants/enums.constant';

export class ListResourcesDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Full-text search across title, description & tags' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ResourceType })
  @IsOptional()
  @IsEnum(ResourceType)
  type?: ResourceType;

  @ApiPropertyOptional({ description: 'Filter by category label' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: ResourceVisibility })
  @IsOptional()
  @IsEnum(ResourceVisibility)
  visibility?: ResourceVisibility;

  @ApiPropertyOptional({ description: 'Return only featured resources' })
  @IsOptional()
  @IsString()
  featured?: string;

  @ApiPropertyOptional({ description: 'Return only resources bookmarked by the current user' })
  @IsOptional()
  @IsString()
  bookmarked?: string;
}
