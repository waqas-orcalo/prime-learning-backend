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
  SignatureRole,
  UserRole,
} from '../../../common/constants';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { ProgressReviewService } from '../services/progress-review.service';
import { CreateProgressReviewDto } from '../dto/create-progress-review.dto';
import { UpdateProgressReviewDto } from '../dto/update-progress-review.dto';

@ApiTags(API_TAGS.PROGRESS_REVIEW)
@ApiBearerAuth()
@Controller(CONTROLLERS.PROGRESS_REVIEW)
@UseGuards(RolesGuard)
export class ProgressReviewController {
  constructor(private readonly progressReviewService: ProgressReviewService) {}

  @Post(API_ENDPOINTS.PROGRESS_REVIEW.CREATE)
  @Roles(UserRole.TRAINER, UserRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Create a progress review' })
  create(@Body() dto: CreateProgressReviewDto, @CurrentUser() user: IAuthUser) {
    return this.progressReviewService.create(dto, user);
  }

  @Get(API_ENDPOINTS.PROGRESS_REVIEW.GET_ALL)
  @ApiOperation({ summary: 'Get all progress reviews (filtered by role)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.progressReviewService.findAll(page, limit, user);
  }

  @Get(API_ENDPOINTS.PROGRESS_REVIEW.GET_ONE)
  @ApiOperation({ summary: 'Get a progress review by ID' })
  findOne(@Param('id') id: string) {
    return this.progressReviewService.findOne(id);
  }

  @Patch(API_ENDPOINTS.PROGRESS_REVIEW.UPDATE)
  @Roles(UserRole.TRAINER, UserRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Update a progress review' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProgressReviewDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.progressReviewService.update(id, dto, user);
  }

  @Patch(`${API_ENDPOINTS.PROGRESS_REVIEW.UPDATE}/signature`)
  @ApiOperation({ summary: 'Add signature to a progress review' })
  addSignature(
    @Param('id') id: string,
    @Body('role') role: SignatureRole,
    @Body('signature') signature: string,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.progressReviewService.addSignature(id, role, signature, user);
  }

  @Delete(API_ENDPOINTS.PROGRESS_REVIEW.DELETE)
  @Roles(UserRole.TRAINER, UserRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Soft-delete a progress review' })
  remove(@Param('id') id: string) {
    return this.progressReviewService.remove(id);
  }
}
