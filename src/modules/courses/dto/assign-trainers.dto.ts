import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, IsMongoId } from 'class-validator';

export class AssignTrainersDto {
  @ApiProperty({
    description: 'Array of trainer user IDs to give access to this course',
    type: [String],
    example: ['64a1f2b3c4d5e6f7a8b9c0d1'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  trainerIds: string[];
}
