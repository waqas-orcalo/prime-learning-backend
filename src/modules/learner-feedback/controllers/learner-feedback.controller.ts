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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API_ENDPOINTS, API_TAGS, CONTROLLERS } from '../../../common/constants';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { LearnerFeedbackService } from '../services/learner-feedback.service';
import { CreateLearnerFeedbackDto } from '../dto/create-learner-feedback.dto';
import { UpdateLearnerFeedbackDto } from '../dto/update-learner-feedback.dto';
import { ListLearnerFeedbackDto } from '../dto/list-learner-feedback.dto';
import { SignLearnerFeedbackDto } from '../dto/sign-learner-feedback.dto';

@ApiTags(API_TAGS.LEARNER_FEEDBACK)
@ApiBearerAuth()
@Controller(CONTROLLERS.LEARNER_FEEDBACK)
@UseGuards(RolesGuard)
export class LearnerFeedbackController {
  constructor(private readonly service: LearnerFeedbackService) {}

  // ── Create ────────────────────────────────────────────────────────────────────
  @Post(API_ENDPOINTS.LEARNER_FEEDBACK.CREATE)
  @ApiOperation({ summary: 'Create a learner feedback form instance' })
  create(@Body() dto: CreateLearnerFeedbackDto, @CurrentUser() user: IAuthUser) {
    return this.service.create(dto, user);
  }

  // ── List ──────────────────────────────────────────────────────────────────────
  @Get(API_ENDPOINTS.LEARNER_FEEDBACK.GET_ALL)
  @ApiOperation({ summary: 'List all learner feedback instances (paginated & filtered)' })
  findAll(@Query() dto: ListLearnerFeedbackDto, @CurrentUser() user: IAuthUser) {
    return this.service.findAll(dto, user);
  }

  // ── Get one ───────────────────────────────────────────────────────────────────
  @Get(API_ENDPOINTS.LEARNER_FEEDBACK.GET_ONE)
  @ApiOperation({ summary: 'Get a single learner feedback form by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // ── Update ────────────────────────────────────────────────────────────────────
  @Patch(API_ENDPOINTS.LEARNER_FEEDBACK.UPDATE)
  @ApiOperation({ summary: 'Update a learner feedback form' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLearnerFeedbackDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.service.update(id, dto, user);
  }

  // ── Delete ────────────────────────────────────────────────────────────────────
  @Delete(API_ENDPOINTS.LEARNER_FEEDBACK.DELETE)
  @ApiOperation({ summary: 'Soft-delete a learner feedback form' })
  remove(@Param('id') id: string, @CurrentUser() user: IAuthUser) {
    return this.service.remove(id, user);
  }

  // ── Sign ──────────────────────────────────────────────────────────────────────
  @Patch(API_ENDPOINTS.LEARNER_FEEDBACK.SIGN)
  @ApiOperation({ summary: 'Record a learner or trainer signature' })
  sign(
    @Param('id') id: string,
    @Body() dto: SignLearnerFeedbackDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.service.sign(id, dto, user);
  }
}
