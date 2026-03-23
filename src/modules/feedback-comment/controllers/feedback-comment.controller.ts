import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API_TAGS, CONTROLLERS } from '../../../common/constants';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { FeedbackCommentService } from '../services/feedback-comment.service';
import { CreateFeedbackCommentDto } from '../dto/create-feedback-comment.dto';
import { UpdateFeedbackCommentDto } from '../dto/update-feedback-comment.dto';

@ApiTags(API_TAGS.FEEDBACK_COMMENTS)
@ApiBearerAuth()
@Controller(CONTROLLERS.FEEDBACK_COMMENTS)
@UseGuards(RolesGuard)
export class FeedbackCommentController {
  constructor(private readonly service: FeedbackCommentService) {}

  @Post('/')
  @ApiOperation({ summary: 'Create a feedback/comment entry' })
  create(@Body() dto: CreateFeedbackCommentDto, @CurrentUser() user: IAuthUser) {
    return this.service.create(dto, user);
  }

  @Get('/activity/:activityId')
  @ApiOperation({ summary: 'Get all feedback/comments for a learning activity' })
  findByActivity(@Param('activityId') activityId: string) {
    return this.service.findByActivity(activityId);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get a feedback/comment by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update a feedback/comment' })
  update(@Param('id') id: string, @Body() dto: UpdateFeedbackCommentDto) {
    return this.service.update(id, dto);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a feedback/comment' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
