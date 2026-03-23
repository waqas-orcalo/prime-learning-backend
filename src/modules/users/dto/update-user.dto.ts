import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '+44 7700 900000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '1998-05-14' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  // ── Extended profile fields ─────────────────────────────────────────────
  @ApiPropertyOptional({ example: 'they/them' })
  @IsOptional()
  @IsString()
  pronouns?: string;

  @ApiPropertyOptional({ example: '+44 20 7946 0958' })
  @IsOptional()
  @IsString()
  landline?: string;

  @ApiPropertyOptional({ example: '+44 7911 123456' })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({ example: 'john.doe' })
  @IsOptional()
  @IsString()
  skype?: string;

  @ApiPropertyOptional({ example: 'https://johndoe.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ example: 'Prime Learning Ltd' })
  @IsOptional()
  @IsString()
  workplace?: string;

  @ApiPropertyOptional({ example: '10 Downing Street, London' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Europe/London' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: '22 Baker Street, London' })
  @IsOptional()
  @IsString()
  homeAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
