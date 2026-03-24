import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../../database/repositories/base/abstract.repository';
import { Resource } from '../schemas/resource.schema';
import { ResourceType, ResourceVisibility } from '../../../common/constants/enums.constant';

@Injectable()
export class ResourceRepository extends AbstractRepository<Resource> {
  protected readonly logger = new Logger(ResourceRepository.name);

  constructor(
    @InjectModel(Resource.name) private readonly resourceModel: Model<Resource>,
    @InjectConnection() connection: Connection,
  ) {
    super(resourceModel, connection);
  }

  async findAllPaginated(
    page: number,
    limit: number,
    options: {
      search?: string;
      type?: ResourceType;
      category?: string;
      visibility?: ResourceVisibility;
      featured?: boolean;
      bookmarkedByUserId?: string;
    } = {},
  ) {
    const filterQuery: Record<string, any> = { isDeleted: false };

    if (options.search) {
      filterQuery.$or = [
        { title:       { $regex: options.search, $options: 'i' } },
        { description: { $regex: options.search, $options: 'i' } },
        { tags:        { $regex: options.search, $options: 'i' } },
        { category:    { $regex: options.search, $options: 'i' } },
      ];
    }

    if (options.type)       filterQuery.type       = options.type;
    if (options.category)   filterQuery.category   = { $regex: options.category, $options: 'i' };
    if (options.visibility) filterQuery.visibility = options.visibility;
    if (options.featured !== undefined) filterQuery.featured = options.featured;

    if (options.bookmarkedByUserId) {
      filterQuery.bookmarkedBy = new Types.ObjectId(options.bookmarkedByUserId);
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
            localField: 'uploadedBy',
            foreignField: '_id',
            as: 'uploaderInfo',
            pipeline: [{ $project: { firstName: 1, lastName: 1, email: 1 } }],
          },
        },
        { $unwind: { path: '$uploaderInfo', preserveNullAndEmptyArrays: true } },
      ],
    });
  }

  async findByIdPopulated(id: string) {
    return this.resourceModel
      .findById(id)
      .populate('uploadedBy', 'firstName lastName email')
      .lean()
      .exec();
  }

  async toggleBookmark(resourceId: string, userId: string) {
    const userObjId  = new Types.ObjectId(userId);
    const existing   = await this.resourceModel.findById(resourceId).lean();
    const isBookmarked = (existing?.bookmarkedBy as Types.ObjectId[])?.some(
      (id) => id.toString() === userId,
    );

    if (isBookmarked) {
      return this.resourceModel
        .findByIdAndUpdate(resourceId, { $pull: { bookmarkedBy: userObjId } }, { new: true, lean: true })
        .exec();
    } else {
      return this.resourceModel
        .findByIdAndUpdate(resourceId, { $addToSet: { bookmarkedBy: userObjId } }, { new: true, lean: true })
        .exec();
    }
  }

  async incrementViews(id: string) {
    return this.resourceModel
      .findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true, lean: true })
      .exec();
  }

  async incrementDownloads(id: string) {
    return this.resourceModel
      .findByIdAndUpdate(id, { $inc: { downloads: 1 } }, { new: true, lean: true })
      .exec();
  }
}
