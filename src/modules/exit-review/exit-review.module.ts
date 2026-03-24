import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExitReview, ExitReviewSchema } from './schemas/exit-review.schema';
import { ExitReviewRepository } from './repository/exit-review.repository';
import { ExitReviewService } from './services/exit-review.service';
import { ExitReviewController } from './controllers/exit-review.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExitReview.name, schema: ExitReviewSchema },
    ]),
  ],
  controllers: [ExitReviewController],
  providers: [ExitReviewService, ExitReviewRepository],
  exports: [ExitReviewService],
})
export class ExitReviewModule {}
