import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from '../tasks/schemas/task.schema';
import {
  LearningActivity,
  LearningActivitySchema,
} from '../learning-activities/schemas/learning-activity.schema';
import { Message, MessageSchema } from '../messages/schemas/message.schema';
import { DashboardService } from './services/dashboard.service';
import { DashboardController } from './controllers/dashboard.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: LearningActivity.name, schema: LearningActivitySchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
