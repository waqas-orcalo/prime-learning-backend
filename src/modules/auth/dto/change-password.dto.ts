import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current (old) password' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ minLength: 8, description: 'New password (min 8 characters)' })
  @IsString()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({ minLength: 8, description: 'Confirm new password (must match newPassword)' })
  @IsString()
  @MinLength(8)
  confirmPassword: string;
}
