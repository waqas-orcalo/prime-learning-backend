import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Task, TaskSchema } from '../tasks/schemas/task.schema';
import {
  LearningActivity,
  LearningActivitySchema,
} from '../learning-activities/schemas/learning-activity.schema';
import {
  LearningJournal,
  LearningJournalSchema,
} from '../learning-journals/schemas/learning-journal.schema';
import { Message, MessageSchema } from '../messages/schemas/message.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { TrainerController } from './controllers/trainer.controller';
import { TrainerService } from './services/trainer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Task.name, schema: TaskSchema },
      { name: LearningActivity.name, schema: LearningActivitySchema },
      { name: LearningJournal.name, schema: LearningJournalSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [TrainerController],
  providers: [TrainerService],
  exports: [TrainerService],
})
export class TrainerModule {}
