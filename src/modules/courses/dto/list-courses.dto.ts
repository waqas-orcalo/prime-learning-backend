import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { CourseStatus } from '../../../common/constants/enums.constant';

export class ListCoursesDto {
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @ApiPropertyOptional({ default: 10 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number = 10;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ enum: CourseStatus }) @IsOptional() @IsEnum(CourseStatus) status?: CourseStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() enrolledUserId?: string;
}
