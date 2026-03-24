import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../../database/repositories/base/abstract.repository';
import { Course } from '../schemas/course.schema';

@Injectable()
export class CourseRepository extends AbstractRepository<Course> {
  protected readonly logger = new Logger(CourseRepository.name);
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectConnection() connection: Connection,
  ) {
    super(courseModel, connection);
  }

  async findAllPaginated(page: number, limit: number, search?: string, status?: string, enrolledUserId?: string) {
    const filterQuery: Record<string, any> = { isDeleted: false };
    if (search) filterQuery.title = { $regex: search, $options: 'i' };
    if (status) filterQuery.status = status;
    if (enrolledUserId) filterQuery.enrolledUsers = { $in: [new Types.ObjectId(enrolledUserId)] };
    return this.paginate({ filterQuery, page, limit });
  }

  async findByIdWithEnrollments(id: string) {
    return this.courseModel
      .findById(id)
      .populate('enrolledUsers', 'firstName lastName email role')
      .lean()
      .exec();
  }
}
