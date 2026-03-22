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
import { PlanOfActivityService } from '../services/plan-of-activity.service';
import { CreatePlanOfActivityDto } from '../dto/create-plan-of-activity.dto';
import { UpdatePlanOfActivityDto } from '../dto/update-plan-of-activity.dto';

@ApiTags(API_TAGS.PLAN_OF_ACTIVITY)
@ApiBearerAuth()
@Controller(CONTROLLERS.PLAN_OF_ACTIVITY)
@UseGuards(RolesGuard)
export class PlanOfActivityController {
  constructor(private readonly planService: PlanOfActivityService) {}

  @Post(API_ENDPOINTS.PLAN_OF_ACTIVITY.CREATE)
  @Roles(UserRole.TRAINER, UserRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Create a plan of activity' })
  create(
    @Body() dto: CreatePlanOfActivityDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.planService.create(dto, user);
  }

  @Get(API_ENDPOINTS.PLAN_OF_ACTIVITY.GET_ALL)
  @ApiOperation({ summary: 'Get all plans of activity (filtered by role)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.planService.findAll(page, limit, user);
  }

  @Get(API_ENDPOINTS.PLAN_OF_ACTIVITY.GET_ONE)
  @ApiOperation({ summary: 'Get a plan of activity by ID' })
  findOne(@Param('id') id: string) {
    return this.planService.findOne(id);
  }

  @Patch(API_ENDPOINTS.PLAN_OF_ACTIVITY.UPDATE)
  @Roles(UserRole.TRAINER, UserRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Update a plan of activity' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePlanOfActivityDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.planService.update(id, dto, user);
  }

  @Patch(`${API_ENDPOINTS.PLAN_OF_ACTIVITY.UPDATE}/sign`)
  @ApiOperation({ summary: 'Sign a plan of activity (learner/trainer/iqa)' })
  sign(
    @Param('id') id: string,
    @Body('role') role: 'learner' | 'trainer' | 'iqa',
  ) {
    return this.planService.sign(id, role);
  }

  @Delete(API_ENDPOINTS.PLAN_OF_ACTIVITY.DELETE)
  @Roles(UserRole.TRAINER, UserRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Soft-delete a plan of activity' })
  remove(@Param('id') id: string) {
    return this.planService.remove(id);
  }
}
