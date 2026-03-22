import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../common/constants/enums.constant';

/**
 * SignUpDto
 * ────────────────────────────────────────────────────────────────────────────
 * Validated on POST /api/v1/auth/signup.
 * Role defaults to LEARNER when omitted so the endpoint stays flexible.
 */
export class SignUpDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty({ message: 'First name is required.' })
  @MinLength(2, { message: 'First name must be at least 2 characters.' })
  @MaxLength(60, { message: 'First name must not exceed 60 characters.' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required.' })
  @MinLength(2, { message: 'Last name must be at least 2 characters.' })
  @MaxLength(60, { message: 'Last name must not exceed 60 characters.' })
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd!',
    description:
      'Min 8 chars, at least one uppercase letter, one lowercase letter, and one digit.',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters.' })
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter.',
  })
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter.',
  })
  @Matches(/[0-9]/, {
    message: 'Password must contain at least one number.',
  })
  password: string;

  @ApiPropertyOptional({
    enum: UserRole,
    default: UserRole.LEARNER,
    description: 'User role — defaults to LEARNER when not provided.',
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid role. Must be one of: LEARNER, TRAINER, ORG_ADMIN.' })
  role?: UserRole;
}
