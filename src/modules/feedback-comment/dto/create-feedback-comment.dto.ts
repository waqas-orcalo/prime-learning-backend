import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { FeedbackCommentType } from '../../../common/constants/enums.constant';

export class CreateFeedbackCommentDto {
  @ApiProperty()
  @IsString()
  learningActivityId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ enum: FeedbackCommentType })
  @IsOptional()
  @IsEnum(FeedbackCommentType)
  type?: FeedbackCommentType;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  files?: string[];
}
