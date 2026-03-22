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
import { TasksService } from '../services/tasks.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { AssignTaskDto } from '../dto/assign-task.dto';

@ApiTags(API_TAGS.TASKS)
@ApiBearerAuth()
@Controller(CONTROLLERS.TASKS)
@UseGuards(RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post(API_ENDPOINTS.TASKS.CREATE)
  @ApiOperation({ summary: 'Create a new task' })
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: IAuthUser) {
    return this.tasksService.create(dto, user);
  }

  @Get(API_ENDPOINTS.TASKS.GET_ALL)
  @ApiOperation({ summary: 'Get all tasks (filtered by role)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.tasksService.findAll(page, limit, user);
  }

  @Get(API_ENDPOINTS.TASKS.GET_ONE)
  @ApiOperation({ summary: 'Get a task by ID' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(API_ENDPOINTS.TASKS.UPDATE)
  @ApiOperation({ summary: 'Update a task' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.tasksService.update(id, dto, user);
  }

  @Patch(API_ENDPOINTS.TASKS.STATUS_UPDATE)
  @ApiOperation({ summary: 'Update task status' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: TaskStatus,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.tasksService.updateStatus(id, status, user);
  }

  @Delete(API_ENDPOINTS.TASKS.DELETE)
  @Roles(UserRole.TRAINER, UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Soft-delete a task (trainer/admin only)' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get task counts by status' })
  getStats(@CurrentUser() user: IAuthUser) {
    return this.tasksService.getStats(user);
  }

  @Post(API_ENDPOINTS.TASKS.ASSIGN)
  @ApiOperation({ summary: 'Assign task to multiple users' })
  assign(@Param('id') id: string, @Body() dto: AssignTaskDto) {
    return this.tasksService.assign(id, dto);
  }
}
