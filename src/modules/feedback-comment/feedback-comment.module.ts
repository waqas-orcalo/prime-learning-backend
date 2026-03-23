import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedbackComment, FeedbackCommentSchema } from './schemas/feedback-comment.schema';
import { FeedbackCommentRepository } from './repository/feedback-comment.repository';
import { FeedbackCommentService } from './services/feedback-comment.service';
import { FeedbackCommentController } from './controllers/feedback-comment.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FeedbackComment.name, schema: FeedbackCommentSchema },
    ]),
  ],
  controllers: [FeedbackCommentController],
  providers: [FeedbackCommentService, FeedbackCommentRepository],
  exports: [FeedbackCommentRepository],
})
export class FeedbackCommentModule {}
