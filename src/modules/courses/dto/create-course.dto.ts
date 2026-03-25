import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CourseStatus } from '../../../common/constants/enums.constant';

export class CreateCourseDto {
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) modules?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() duration?: string;
  @ApiPropertyOptional({ enum: CourseStatus }) @IsOptional() @IsEnum(CourseStatus) status?: CourseStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() thumbnailEmoji?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() courseModules?: {
    name: string;
    slides: { content: string }[];
    quiz?: {
      passingScore?: number;
      questions: { question: string; options: string[]; correctIndex: number; explanation?: string }[];
    };
  }[];
}
