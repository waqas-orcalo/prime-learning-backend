import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProgressReview,
  ProgressReviewSchema,
} from './schemas/progress-review.schema';
import { ProgressReviewRepository } from './repository/progress-review.repository';
import { ProgressReviewService } from './services/progress-review.service';
import { ProgressReviewController } from './controllers/progress-review.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProgressReview.name, schema: ProgressReviewSchema },
    ]),
  ],
  controllers: [ProgressReviewController],
  providers: [ProgressReviewService, ProgressReviewRepository],
  exports: [ProgressReviewRepository],
})
export class ProgressReviewModule {}
