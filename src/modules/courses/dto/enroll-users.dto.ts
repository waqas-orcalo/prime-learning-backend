import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class EnrollUsersDto {
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) @ArrayMinSize(1) userIds: string[];
}
