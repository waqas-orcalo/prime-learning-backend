import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { API_ENDPOINTS, API_TAGS, CONTROLLERS } from '../../../common/constants';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { ActivityLogService } from '../services/activity-log.service';

@ApiTags(API_TAGS.ACTIVITY_LOG)
@ApiBearerAuth()
@Controller(CONTROLLERS.ACTIVITY_LOG)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get(API_ENDPOINTS.ACTIVITY_LOG.GET_ALL)
  @ApiOperation({ summary: 'Get activity logs (filtered by role)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String })
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('userId') userId: string,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.activityLogService.findAll(page, limit, user, userId);
  }

  @Get(API_ENDPOINTS.ACTIVITY_LOG.GET_ONE)
  @ApiOperation({ summary: 'Get a single activity log entry' })
  findOne(@Param('id') id: string) {
    return this.activityLogService.findOne(id);
  }
}
