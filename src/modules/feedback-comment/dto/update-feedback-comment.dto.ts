import { PartialType } from '@nestjs/swagger';
import { CreateFeedbackCommentDto } from './create-feedback-comment.dto';
export class UpdateFeedbackCommentDto extends PartialType(CreateFeedbackCommentDto) {}
