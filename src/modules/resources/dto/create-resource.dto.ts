import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ResourceType, ResourceVisibility } from '../../../common/constants/enums.constant';

export class CreateResourceDto {
  @ApiProperty({ description: 'Title of the resource' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Short description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ResourceType, description: 'Resource type' })
  @IsEnum(ResourceType)
  type: ResourceType;

  @ApiPropertyOptional({ description: 'Category label e.g. Guides, Policies' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ type: [String], description: 'Tags for filtering' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: ResourceVisibility })
  @IsOptional()
  @IsEnum(ResourceVisibility)
  visibility?: ResourceVisibility;

  // File fields (set by the service after upload)
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  fileSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mimeType?: string;

  // For LINK type
  @ApiPropertyOptional({ description: 'External URL (for LINK type)' })
  @IsOptional()
  @IsUrl()
  externalUrl?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
