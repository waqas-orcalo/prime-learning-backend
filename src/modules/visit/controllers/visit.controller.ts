import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  API_ENDPOINTS,
  API_TAGS,
  CONTROLLERS,
  UserRole,
} from '../../../common/constants';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { VisitService } from '../services/visit.service';
import { CreateVisitDto } from '../dto/create-visit.dto';
import { UpdateVisitDto } from '../dto/update-visit.dto';

@ApiTags(API_TAGS.VISIT)
@ApiBearerAuth()
@Controller(CONTROLLERS.VISIT)
@UseGuards(RolesGuard)
export class VisitController {
  constructor(private readonly visitService: VisitService) {}

  @Post(API_ENDPOINTS.VISIT.CREATE)
  @ApiOperation({ summary: 'Create a visit record' })
  create(@Body() dto: CreateVisitDto, @CurrentUser() user: IAuthUser) {
    return this.visitService.create(dto, user);
  }

  @Get(API_ENDPOINTS.VISIT.GET_ALL)
  @ApiOperation({ summary: 'Get all visits (filtered by role)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.visitService.findAll(page, limit, user);
  }

  @Get(API_ENDPOINTS.VISIT.GET_ONE)
  @ApiOperation({ summary: 'Get a visit by ID' })
  findOne(@Param('id') id: string) {
    return this.visitService.findOne(id);
  }

  @Patch(API_ENDPOINTS.VISIT.UPDATE)
  @ApiOperation({ summary: 'Update a visit' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVisitDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.visitService.update(id, dto, user);
  }

  @Patch(`${API_ENDPOINTS.VISIT.UPDATE}/signature`)
  @ApiOperation({ summary: 'Add a signature to a visit' })
  addSignature(
    @Param('id') id: string,
    @Body('type') type: 'learner' | 'trainer',
    @Body('signature') signature: string,
  ) {
    return this.visitService.addSignature(id, type, signature);
  }

  @Delete(API_ENDPOINTS.VISIT.DELETE)
  @Roles(UserRole.TRAINER, UserRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Soft-delete a visit (trainer/admin only)' })
  remove(@Param('id') id: string) {
    return this.visitService.remove(id);
  }
}
