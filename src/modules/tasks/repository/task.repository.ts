import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../../database/repositories/base/abstract.repository';
import { Task } from '../schemas/task.schema';
import { TaskStatus } from '../../../common/constants/enums.constant';

@Injectable()
export class TaskRepository extends AbstractRepository<Task> {
  protected readonly logger = new Logger(TaskRepository.name);

  constructor(
    @InjectModel(Task.name) taskModel: Model<Task>,
    @InjectConnection() connection: Connection,
  ) {
    super(taskModel, connection);
  }

  // ── Domain queries ─────────────────────────────────────────────────────────

  async findByAssignee(userId: string, page: number, limit: number) {
    return this.paginate({
      filterQuery: {
        assignedTo: new Types.ObjectId(userId),
        isDeleted: false,
      } as any,
      page,
      limit,
    });
  }

  async countByStatus(organizationId?: string) {
    return this.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
  }

  async softDelete(id: string) {
    return this.findOneAndUpdate({ _id: new Types.ObjectId(id) } as any, {
      $set: { isDeleted: true },
    });
  }
}
