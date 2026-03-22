import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API_ENDPOINTS, API_TAGS, CONTROLLERS } from '../../../common/constants';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { DashboardService } from '../services/dashboard.service';

@ApiTags(API_TAGS.DASHBOARD)
@ApiBearerAuth()
@Controller(CONTROLLERS.DASHBOARD)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get(API_ENDPOINTS.DASHBOARD.STATS)
  @ApiOperation({ summary: 'Get dashboard statistics for current user' })
  getStats(@CurrentUser() user: IAuthUser) {
    return this.dashboardService.getStats(user);
  }

  @Get(API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITY)
  @ApiOperation({ summary: 'Get recent activity for current user' })
  getRecentActivity(@CurrentUser() user: IAuthUser) {
    return this.dashboardService.getRecentActivity(user);
  }
}
