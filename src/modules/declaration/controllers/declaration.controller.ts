import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API_TAGS, CONTROLLERS } from '../../../common/constants';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { DeclarationService } from '../services/declaration.service';
import { UpsertDeclarationDto } from '../dto/upsert-declaration.dto';

@ApiTags(API_TAGS.DECLARATION)
@ApiBearerAuth()
@Controller(CONTROLLERS.DECLARATION)
@UseGuards(RolesGuard)
export class DeclarationController {
  constructor(private readonly service: DeclarationService) {}

  @Get('/:activityId')
  @ApiOperation({ summary: 'Get declaration for a learning activity' })
  getByActivity(@Param('activityId') activityId: string) {
    return this.service.getByActivity(activityId);
  }

  @Post('/:activityId')
  @ApiOperation({ summary: 'Upsert declaration for a learning activity' })
  upsert(
    @Param('activityId') activityId: string,
    @Body() dto: UpsertDeclarationDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.service.upsert(activityId, dto, user);
  }

  @Post('/:activityId/sign')
  @ApiOperation({ summary: 'Sign the declaration (learner or trainer)' })
  sign(
    @Param('activityId') activityId: string,
    @Body('role') role: 'learner' | 'trainer',
    @Body('signature') signature: string,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.service.sign(activityId, role, signature, user);
  }
}
