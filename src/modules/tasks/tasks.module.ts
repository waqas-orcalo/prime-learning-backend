import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/task.schema';
import { TaskRepository } from './repository/task.repository';
import { TasksService } from './services/tasks.service';
import { TasksController } from './controllers/tasks.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    NotificationsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, TaskRepository],
  exports: [TaskRepository],
})
export class TasksModule {}
