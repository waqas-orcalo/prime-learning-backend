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
      /** Scope results to resources this user can see (own + shared). Admins skip this. */
      accessUserId?: string;
      /** If true, bypass per-user access scoping (used for admins) */
      skipAccessFilter?: boolean;
    } = {},
  ) {
    const filterQuery: Record<string, any> = { isDeleted: false };

    // ── Access control: only show resources the user owns or that are shared with them ──
    if (!options.skipAccessFilter && options.accessUserId) {
      const uid = new Types.ObjectId(options.accessUserId);
      filterQuery.$or = [
        { uploadedBy: uid },
        { sharedWith: uid },
      ];
    }

    if (options.search) {
      // Merge search $or with the access $or via $and
      const searchConditions = [
        { title:       { $regex: options.search, $options: 'i' } },
        { description: { $regex: options.search, $options: 'i' } },
        { tags:        { $regex: options.search, $options: 'i' } },
        { category:    { $regex: options.search, $options: 'i' } },
      ];
      if (filterQuery.$or) {
        // Combine access filter + search filter via $and
        filterQuery.$and = [
          { $or: filterQuery.$or },
          { $or: searchConditions },
        ];
        delete filterQuery.$or;
      } else {
        filterQuery.$or = searchConditions;
      }
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

  /** Add userIds to the sharedWith array (idempotent - uses $addToSet) */
  async shareWithUsers(resourceId: string, userIds: string[]) {
    const objIds = userIds.map((id) => new Types.ObjectId(id));
    return this.resourceModel
      .findByIdAndUpdate(
        resourceId,
        { $addToSet: { sharedWith: { $each: objIds } } },
        { new: true, lean: true },
      )
      .exec();
  }

  /** Remove a userId from sharedWith (revoke access) */
  async revokeShare(resourceId: string, userId: string) {
    return this.resourceModel
      .findByIdAndUpdate(
        resourceId,
        { $pull: { sharedWith: new Types.ObjectId(userId) } },
        { new: true, lean: true },
      )
      .exec();
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
