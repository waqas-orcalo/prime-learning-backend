import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../../database/repositories/base/abstract.repository';
import { LearningSupport } from '../schemas/learning-support.schema';

@Injectable()
export class LearningSupportRepository extends AbstractRepository<LearningSupport> {
  protected readonly logger = new Logger(LearningSupportRepository.name);

  constructor(
    @InjectModel(LearningSupport.name) private readonly learningSupportModel: Model<LearningSupport>,
    @InjectConnection() connection: Connection,
  ) {
    super(learningSupportModel, connection);
  }

  async findAllPaginated(
    page: number,
    limit: number,
    options: {
      learnerId?: string;
      trainerId?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {},
  ) {
    const filterQuery: Record<string, any> = { isDeleted: false };

    if (options.learnerId) filterQuery.learnerId = new Types.ObjectId(options.learnerId);
    if (options.trainerId) filterQuery.trainerId = new Types.ObjectId(options.trainerId);

    if (options.dateFrom || options.dateTo) {
      filterQuery.createdAt = {};
      if (options.dateFrom) filterQuery.createdAt.$gte = new Date(options.dateFrom);
      if (options.dateTo)   filterQuery.createdAt.$lte = new Date(options.dateTo);
    }

    return this.paginate({
      filterQuery,
      page,
      limit,
      sortBy: 'createdAt',
      sortOrder: -1,
      pipelines: [
        {
          $lookup: {
            from: 'users',
            localField: 'learnerId',
            foreignField: '_id',
            as: 'learner',
            pipeline: [{ $project: { firstName: 1, lastName: 1, email: 1 } }],
          },
        },
        { $unwind: { path: '$learner', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'trainerId',
            foreignField: '_id',
            as: 'trainer',
            pipeline: [{ $project: { firstName: 1, lastName: 1, email: 1 } }],
          },
        },
        { $unwind: { path: '$trainer', preserveNullAndEmptyArrays: true } },
      ],
    });
  }

  async findByIdPopulated(id: string) {
    return this.learningSupportModel
      .findById(id)
      .populate('learnerId', 'firstName lastName email role')
      .populate('trainerId', 'firstName lastName email role')
      .lean()
      .exec();
  }
}
