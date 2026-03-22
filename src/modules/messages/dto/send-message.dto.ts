import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: '64f1a2b3c4d5e6f7a8b9c0d1' })
  @IsString()
  recipientId: string;

  @ApiProperty({ example: 'Hello, how are you progressing with Unit 3?' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}
