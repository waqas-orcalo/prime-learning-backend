import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
import { TrainerService } from '../services/trainer.service';
import { AssignLearnerDto } from '../dto/assign-learner.dto';
import { ListMyLearnersDto } from '../dto/list-my-learners.dto';
import { ReportParamsDto } from '../dto/report-params.dto';

@ApiTags(API_TAGS.TRAINER)
@ApiBearerAuth()
@Controller(CONTROLLERS.TRAINER)
@UseGuards(RolesGuard)
@Roles(UserRole.TRAINER, UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN)
export class TrainerController {
  constructor(private readonly trainerService: TrainerService) {}

  // ── My Learners ──────────────────────────────────────────────────────────

  @Get(API_ENDPOINTS.TRAINER.MY_LEARNERS)
  @ApiOperation({ summary: 'List learners assigned to the current trainer' })
  getMyLearners(
    @Query() dto: ListMyLearnersDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.trainerService.getMyLearners(dto, user);
  }

  // ── Assign / Unassign Learner ─────────────────────────────────────────────

  @Post(API_ENDPOINTS.TRAINER.ASSIGN_LEARNER)
  @ApiOperation({ summary: 'Assign a learner to this trainer' })
  assignLearner(
    @Body() dto: AssignLearnerDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.trainerService.assignLearner(dto, user);
  }

  @Delete(API_ENDPOINTS.TRAINER.UNASSIGN_LEARNER)
  @ApiOperation({ summary: 'Unassign a learner from this trainer' })
  unassignLearner(
    @Param('learnerId') learnerId: string,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.trainerService.unassignLearner(learnerId, user);
  }

  // ── Learner Detail ────────────────────────────────────────────────────────

  @Get(API_ENDPOINTS.TRAINER.LEARNER_DETAIL)
  @ApiOperation({ summary: 'Get detailed info about a specific assigned learner' })
  getLearnerDetail(
    @Param('learnerId') learnerId: string,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.trainerService.getLearnerDetail(learnerId, user);
  }

  // ── Learner Portfolio ─────────────────────────────────────────────────────

  @Get(API_ENDPOINTS.TRAINER.LEARNER_PORTFOLIO)
  @ApiOperation({ summary: 'Get portfolio (tasks, activities, journals) for a learner' })
  getLearnerPortfolio(
    @Param('learnerId') learnerId: string,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.trainerService.getLearnerPortfolio(learnerId, user);
  }

  // ── Learner Progress ──────────────────────────────────────────────────────

  @Get(API_ENDPOINTS.TRAINER.LEARNER_PROGRESS)
  @ApiOperation({ summary: 'Get progress analytics for a learner' })
  getLearnerProgress(
    @Param('learnerId') learnerId: string,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.trainerService.getLearnerProgress(learnerId, user);
  }

  // ── Trainer Dashboard Stats ───────────────────────────────────────────────

  @Get(API_ENDPOINTS.TRAINER.DASHBOARD_STATS)
  @ApiOperation({ summary: 'Get trainer-scoped dashboard statistics' })
  getDashboardStats(@CurrentUser() user: IAuthUser) {
    return this.trainerService.getDashboardStats(user);
  }

  @Get(API_ENDPOINTS.TRAINER.DASHBOARD_CHARTS)
  @ApiOperation({ summary: 'Get all chart data for the trainer dashboard in one call' })
  getDashboardCharts(@CurrentUser() user: IAuthUser) {
    return this.trainerService.getDashboardCharts(user);
  }

  // ── Reports ───────────────────────────────────────────────────────────────

  @Get(API_ENDPOINTS.TRAINER.REPORTS)
  @ApiOperation({ summary: 'Get a report by type for assigned learners' })
  getReport(
    @Param('type') type: string,
    @Query() dto: ReportParamsDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.trainerService.getReport(type, dto, user);
  }
}
