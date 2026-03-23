import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpsertDeclarationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  learnerAgreed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  learnerSignature?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  trainerAgreed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trainerSignature?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  agreedToTerms?: boolean;
}
