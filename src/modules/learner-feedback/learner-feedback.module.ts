import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LearnerFeedback, LearnerFeedbackSchema } from './schemas/learner-feedback.schema';
import { LearnerFeedbackRepository } from './repository/learner-feedback.repository';
import { LearnerFeedbackService } from './services/learner-feedback.service';
import { LearnerFeedbackController } from './controllers/learner-feedback.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LearnerFeedback.name, schema: LearnerFeedbackSchema },
    ]),
  ],
  controllers: [LearnerFeedbackController],
  providers: [LearnerFeedbackService, LearnerFeedbackRepository],
  exports: [LearnerFeedbackService, LearnerFeedbackRepository],
})
export class LearnerFeedbackModule {}
