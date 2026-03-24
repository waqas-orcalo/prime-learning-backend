import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CONTROLLERS } from '../../../common/constants/controllers.constant';
import { API_ENDPOINTS } from '../../../common/constants/endpoints.constant';
import { API_TAGS } from '../../../common/constants/swagger-tags.constant';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { ExitReviewService } from '../services/exit-review.service';
import { CreateExitReviewDto } from '../dto/create-exit-review.dto';
import { UpdateExitReviewDto } from '../dto/update-exit-review.dto';
import { ListExitReviewDto } from '../dto/list-exit-review.dto';
import { SignExitReviewDto } from '../dto/sign-exit-review.dto';

@ApiTags(API_TAGS.EXIT_REVIEW)
@Controller(CONTROLLERS.EXIT_REVIEW)
export class ExitReviewController {
  constructor(private readonly service: ExitReviewService) {}

  @Post(API_ENDPOINTS.EXIT_REVIEW.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new exit review form' })
  create(
    @Body() dto: CreateExitReviewDto,
    @CurrentUser() currentUser: IAuthUser,
  ) {
    return this.service.create(dto, currentUser);
  }

  @Get(API_ENDPOINTS.EXIT_REVIEW.GET_ALL)
  @ApiOperation({ summary: 'List exit review forms (paginated)' })
  findAll(
    @Query() dto: ListExitReviewDto,
    @CurrentUser() currentUser: IAuthUser,
  ) {
    return this.service.findAll(dto, currentUser);
  }

  @Get(API_ENDPOINTS.EXIT_REVIEW.GET_ONE)
  @ApiOperation({ summary: 'Get a single exit review form by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(API_ENDPOINTS.EXIT_REVIEW.UPDATE)
  @ApiOperation({ summary: 'Update an exit review form' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExitReviewDto,
    @CurrentUser() currentUser: IAuthUser,
  ) {
    return this.service.update(id, dto, currentUser);
  }

  @Delete(API_ENDPOINTS.EXIT_REVIEW.DELETE)
  @ApiOperation({ summary: 'Soft-delete an exit review form' })
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: IAuthUser,
  ) {
    return this.service.remove(id, currentUser);
  }

  @Patch(API_ENDPOINTS.EXIT_REVIEW.SIGN)
  @ApiOperation({ summary: 'Record learner or trainer signature' })
  sign(
    @Param('id') id: string,
    @Body() dto: SignExitReviewDto,
    @CurrentUser() currentUser: IAuthUser,
  ) {
    return this.service.sign(id, dto, currentUser);
  }
}
