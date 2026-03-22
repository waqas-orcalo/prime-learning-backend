import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { AbstractRepository } from '../../../database/repositories/base/abstract.repository';
import { ActivityLog } from '../schemas/activity-log.schema';

@Injectable()
export class ActivityLogRepository extends AbstractRepository<ActivityLog> {
  protected readonly logger = new Logger(ActivityLogRepository.name);

  constructor(
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLog>,
    @InjectConnection() connection: Connection,
  ) {
    super(activityLogModel, connection);
  }

  async findByUser(userId: string, page: number, limit: number) {
    return this.paginate({
      filterQuery: {
        performedBy: new Types.ObjectId(userId),
      } as any,
      page,
      limit,
    });
  }
}
