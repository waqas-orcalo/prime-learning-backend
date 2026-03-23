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
} from '../../../common/constants';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { LearningJournalsService } from '../services/learning-journals.service';
import { CreateLearningJournalDto } from '../dto/create-learning-journal.dto';
import { UpdateLearningJournalDto } from '../dto/update-learning-journal.dto';

@ApiTags(API_TAGS.LEARNING_JOURNALS)
@ApiBearerAuth()
@Controller(CONTROLLERS.LEARNING_JOURNALS)
@UseGuards(RolesGuard)
export class LearningJournalsController {
  constructor(
    private readonly learningJournalsService: LearningJournalsService,
  ) {}

  @Post(API_ENDPOINTS.LEARNING_JOURNALS.CREATE)
  @ApiOperation({ summary: 'Create a new learning journal entry' })
  create(
    @Body() dto: CreateLearningJournalDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.learningJournalsService.create(dto, user);
  }

  @Get(API_ENDPOINTS.LEARNING_JOURNALS.GET_ALL)
  @ApiOperation({ summary: 'Get all learning journal entries' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'privacy', required: false, type: String })
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('privacy') privacy: string,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.learningJournalsService.findAll(page, limit, search, privacy, user);
  }

  @Get(API_ENDPOINTS.LEARNING_JOURNALS.GET_ONE)
  @ApiOperation({ summary: 'Get a learning journal entry by ID' })
  findOne(@Param('id') id: string) {
    return this.learningJournalsService.findOne(id);
  }

  @Patch(API_ENDPOINTS.LEARNING_JOURNALS.UPDATE)
  @ApiOperation({ summary: 'Update a learning journal entry' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLearningJournalDto,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.learningJournalsService.update(id, dto, user);
  }

  @Delete(API_ENDPOINTS.LEARNING_JOURNALS.DELETE)
  @ApiOperation({ summary: 'Delete a learning journal entry' })
  remove(@Param('id') id: string, @CurrentUser() user: IAuthUser) {
    return this.learningJournalsService.remove(id, user);
  }
}
