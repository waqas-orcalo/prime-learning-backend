import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePresenceDto {
  @ApiPropertyOptional({ example: 'Online', enum: ['Online', 'Available', 'Busy', 'Out of office'] })
  @IsOptional()
  @IsString()
  presenceStatus?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  showOnlineStatus?: boolean;

  @ApiPropertyOptional({ example: 'Back on Monday' })
  @IsOptional()
  @IsString()
  oooMessage?: string;
}
