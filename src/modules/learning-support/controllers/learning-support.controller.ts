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
import { LearningSupportService } from '../services/learning-support.service';
import { CreateLearningSupportDto } from '../dto/create-learning-support.dto';
import { UpdateLearningSupportDto } from '../dto/update-learning-support.dto';
import { ListLearningSupportDto } from '../dto/list-learning-support.dto';
import { SignLearningSupportDto } from '../dto/sign-learning-support.dto';

@ApiTags(API_TAGS.LEARNING_SUPPORT)
@Controller(CONTROLLERS.LEARNING_SUPPORT)
export class LearningSupportController {
  constructor(private readonly service: LearningSupportService) {}

  @Post(API_ENDPOINTS.LEARNING_SUPPORT.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new learning support form' })
  create(
    @Body() dto: CreateLearningSupportDto,
    @CurrentUser() currentUser: IAuthUser,
  ) {
    return this.service.create(dto, currentUser);
  }

  @Get(API_ENDPOINTS.LEARNING_SUPPORT.GET_ALL)
  @ApiOperation({ summary: 'List learning support forms (paginated)' })
  findAll(
    @Query() dto: ListLearningSupportDto,
    @CurrentUser() currentUser: IAuthUser,
  ) {
    return this.service.findAll(dto, currentUser);
  }

  @Get(API_ENDPOINTS.LEARNING_SUPPORT.GET_ONE)
  @ApiOperation({ summary: 'Get a single learning support form by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(API_ENDPOINTS.LEARNING_SUPPORT.UPDATE)
  @ApiOperation({ summary: 'Update a learning support form' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLearningSupportDto,
    @CurrentUser() currentUser: IAuthUser,
  ) {
    return this.service.update(id, dto, currentUser);
  }

  @Delete(API_ENDPOINTS.LEARNING_SUPPORT.DELETE)
  @ApiOperation({ summary: 'Soft-delete a learning support form' })
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: IAuthUser,
  ) {
    return this.service.remove(id, currentUser);
  }

  @Patch(API_ENDPOINTS.LEARNING_SUPPORT.SIGN)
  @ApiOperation({ summary: 'Record learner or trainer signature' })
  sign(
    @Param('id') id: string,
    @Body() dto: SignLearningSupportDto,
    @CurrentUser() currentUser: IAuthUser,
  ) {
    return this.service.sign(id, dto, currentUser);
  }
}
