import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PlanOfActivity,
  PlanOfActivitySchema,
} from './schemas/plan-of-activity.schema';
import { PlanOfActivityRepository } from './repository/plan-of-activity.repository';
import { PlanOfActivityService } from './services/plan-of-activity.service';
import { PlanOfActivityController } from './controllers/plan-of-activity.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlanOfActivity.name, schema: PlanOfActivitySchema },
    ]),
  ],
  controllers: [PlanOfActivityController],
  providers: [PlanOfActivityService, PlanOfActivityRepository],
  exports: [PlanOfActivityRepository],
})
export class PlanOfActivityModule {}
