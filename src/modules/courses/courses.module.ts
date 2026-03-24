import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from './schemas/course.schema';
import { CourseProgress, CourseProgressSchema } from './schemas/course-progress.schema';
import { CourseRepository } from './repository/course.repository';
import { CoursesService } from './services/courses.service';
import { CoursesController } from './controllers/courses.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: CourseProgress.name, schema: CourseProgressSchema },
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService, CourseRepository],
  exports: [CoursesService, CourseRepository],
})
export class CoursesModule {}
