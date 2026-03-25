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

  async findAllPaginated(
    page: number,
    limit: number,
    search?: string,
    status?: string,
    enrolledUserId?: string,
    options?: {
      /** When set, only return courses this trainer created OR was assigned to */
      trainerAccessId?: string;
    },
  ) {
    const filterQuery: Record<string, any> = { isDeleted: false };

    // ── Trainer-scoped access: own courses + admin-assigned courses ──────────
    if (options?.trainerAccessId) {
      const tid = new Types.ObjectId(options.trainerAccessId);
      filterQuery.$or = [
        { createdBy: tid },
        { assignedTrainers: tid },
      ];
    }

    if (search) {
      const searchCond = { title: { $regex: search, $options: 'i' } };
      if (filterQuery.$or) {
        // Merge with existing $or via $and
        filterQuery.$and = [{ $or: filterQuery.$or }, searchCond];
        delete filterQuery.$or;
      } else {
        Object.assign(filterQuery, searchCond);
      }
    }

    if (status) filterQuery.status = status;
    if (enrolledUserId) filterQuery.enrolledUsers = { $in: [new Types.ObjectId(enrolledUserId)] };

    return this.paginate({ filterQuery, page, limit });
  }

  /** Add trainerIds to assignedTrainers (idempotent) */
  async assignTrainers(courseId: string, trainerIds: string[]) {
    const objIds = trainerIds.map((id) => new Types.ObjectId(id));
    return this.courseModel
      .findByIdAndUpdate(
        courseId,
        { $addToSet: { assignedTrainers: { $each: objIds } } },
        { new: true, lean: true },
      )
      .exec();
  }

  /** Remove a single trainer from assignedTrainers */
  async revokeTrainer(courseId: string, trainerId: string) {
    return this.courseModel
      .findByIdAndUpdate(
        courseId,
        { $pull: { assignedTrainers: new Types.ObjectId(trainerId) } },
        { new: true, lean: true },
      )
      .exec();
  }

  async findByIdWithEnrollments(id: string) {
    return this.courseModel
      .findById(id)
      .populate('enrolledUsers', 'firstName lastName email role')
      .lean()
      .exec();
  }
}
