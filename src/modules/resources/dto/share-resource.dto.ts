import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, ArrayMinSize } from 'class-validator';

export class ShareResourceDto {
  @ApiProperty({
    description: 'Array of user IDs to share this resource with',
    type: [String],
    example: ['64a1f2b3c4d5e6f7a8b9c0d1'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  userIds: string[];
}
