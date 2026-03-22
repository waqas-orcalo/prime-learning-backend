import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  LearningActivity,
  LearningActivitySchema,
} from './schemas/learning-activity.schema';
import { LearningActivityRepository } from './repository/learning-activity.repository';
import { LearningActivitiesService } from './services/learning-activities.service';
import { LearningActivitiesController } from './controllers/learning-activities.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LearningActivity.name, schema: LearningActivitySchema },
    ]),
  ],
  controllers: [LearningActivitiesController],
  providers: [LearningActivitiesService, LearningActivityRepository],
  exports: [LearningActivityRepository],
})
export class LearningActivitiesModule {}
