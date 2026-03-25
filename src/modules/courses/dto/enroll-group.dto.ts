import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class EnrollGroupDto {
  @ApiProperty({ description: 'Group ID to enroll all members of this group' })
  @IsString()
  @IsNotEmpty()
  groupId: string;
}
