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
  TaskStatus,
  UserRole,
} from '../../../common/constants';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { LearningActivitiesService } from '../services/learning-activities.service';
import { CreateLearningActivityDto } from '../dto/create-learning-activity.dto';
import { UpdateLearningActivityDto } from '../dto/update-learning-activity.dto';

@ApiTags(API_TAGS.LEARNING_ACTIVITIES)
@ApiBearerAuth()
@Controller(CONTROLLERS.LEARNING_ACTIVITIES)
@UseGuards(RolesGuard)
export class LearningActivitiesController {
  constructor(
    private readonly learningActivitiesService: LearningActivitiesService,
  ) {}

  @Post(API_ENDPOINTS.LEARNING_ACTIVITIES.CREATE)
  @ApiOperation({ summary: 'Create a new learning activity' })
  create(
    @Body() dto: CreateLearningActivityDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.learningActivitiesService.create(dto, user);
  }

  @Get(API_ENDPOINTS.LEARNING_ACTIVITIES.GET_ALL)
  @ApiOperation({ summary: 'Get all learning activities (filtered by role)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.learningActivitiesService.findAll(page, limit, user);
  }

  @Get(API_ENDPOINTS.LEARNING_ACTIVITIES.GET_ONE)
  @ApiOperation({ summary: 'Get a learning activity by ID' })
  findOne(@Param('id') id: string) {
    return this.learningActivitiesService.findOne(id);
  }

  @Patch(API_ENDPOINTS.LEARNING_ACTIVITIES.UPDATE)
  @ApiOperation({ summary: 'Update a learning activity' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLearningActivityDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.learningActivitiesService.update(id, dto, user);
  }

  @Patch(API_ENDPOINTS.LEARNING_ACTIVITIES.STATUS_UPDATE)
  @ApiOperation({ summary: 'Update learning activity status' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: TaskStatus,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.learningActivitiesService.updateStatus(id, status, user);
  }

  @Delete(API_ENDPOINTS.LEARNING_ACTIVITIES.DELETE)
  @Roles(UserRole.TRAINER, UserRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Soft-delete a learning activity (trainer/admin only)' })
  remove(@Param('id') id: string) {
    return this.learningActivitiesService.remove(id);
  }
}
