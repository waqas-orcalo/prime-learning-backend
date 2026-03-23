import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateEvidenceDto {
  @ApiProperty({ description: 'Learning activity ID' })
  @IsString()
  learningActivityId: string;

  @ApiPropertyOptional({ description: 'Rich text evidence content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'File attachments', type: [Object] })
  @IsOptional()
  @IsArray()
  files?: any[];
}
