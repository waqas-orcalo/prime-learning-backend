import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { AbstractRepository } from '../../../database/repositories/base/abstract.repository';
import { TimesheetEntry } from '../schemas/timesheet-entry.schema';

@Injectable()
export class TimesheetEntryRepository extends AbstractRepository<TimesheetEntry> {
  protected readonly logger = new Logger(TimesheetEntryRepository.name);

  constructor(
    @InjectModel(TimesheetEntry.name) private readonly tsModel: Model<TimesheetEntry>,
    @InjectConnection() connection: Connection,
  ) {
    super(tsModel, connection);
  }

  async softDelete(id: string): Promise<void> {
    await this.tsModel.findByIdAndUpdate(id, { $set: { isDeleted: true } });
  }

  async findByActivity(activityId: string): Promise<TimesheetEntry[]> {
    return this.tsModel
      .find({ learningActivityId: new Types.ObjectId(activityId), isDeleted: false })
      .sort({ dateFrom: -1 })
      .lean()
      .exec() as any;
  }

  async getOtjStats(userId?: string) {
    const matchStage: any = { isDeleted: false };
    if (userId) matchStage.spentBy = new Types.ObjectId(userId);

    return this.tsModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          totalMinutes: { $sum: '$timeMinutes' },
          offJobMinutes: { $sum: { $cond: ['$offJob', '$timeMinutes', 0] } },
          count: { $sum: 1 },
        },
      },
    ]);
  }
}
