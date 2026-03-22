import {
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AggregateOptions,
  Connection,
  FilterQuery,
  Model,
  PipelineStage,
  ProjectionType,
  QueryOptions,
  SaveOptions,
  Types,
  UpdateQuery,
  ClientSession,
} from 'mongoose';
import { AbstractSchema } from '../../schemas/abstract/abstract.schema';

/**
 * AbstractRepository<TDocument>
 * ────────────────────────────────────────────────────────────────────────────
 * Generic base repository that every feature repository extends.
 * Provides: create, find, findOne, update, delete, paginate, aggregate.
 *
 * Repository Pattern:
 *   - Services NEVER call Mongoose directly
 *   - Services inject their domain repository (e.g. UserRepository)
 *   - Repositories extend AbstractRepository and only add domain-specific queries
 *
 * Inspired by:
 *   AAC-BE-DEV-001 › libs/shared/src/schema/abstract-repo/abstract.repository.ts
 */
export abstract class AbstractRepository<TDocument extends AbstractSchema> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) {}

  // ── Create ─────────────────────────────────────────────────────────────────

  async create(
    document: Partial<TDocument>,
    options?: SaveOptions & { session?: ClientSession },
  ): Promise<TDocument> {
    try {
      const created = new this.model({
        _id: new Types.ObjectId(),
        ...document,
      });
      return (await created.save(options)).toJSON() as unknown as TDocument;
    } catch (err: any) {
      if (err.message?.includes('duplicate') || err.code === 11000) {
        throw new ConflictException('Record already exists.');
      }
      throw new BadRequestException('Invalid data provided.');
    }
  }

  async createMany(
    documents: Partial<TDocument>[],
    options?: { session?: ClientSession },
  ): Promise<TDocument[]> {
    const docs = documents.map((d) => ({ _id: new Types.ObjectId(), ...d }));
    return this.model.insertMany(docs, options) as unknown as TDocument[];
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  async findOne(
    filterQuery: FilterQuery<TDocument>,
    projection?: ProjectionType<TDocument>,
    options?: QueryOptions<TDocument> & { throwIfNotFound?: boolean },
  ): Promise<TDocument | null> {
    const { throwIfNotFound = true, ...queryOptions } = options ?? {};
    const doc = await this.model
      .findOne(filterQuery, projection ?? {}, { lean: true, ...queryOptions })
      .exec();

    if (!doc && throwIfNotFound) {
      throw new NotFoundException('Record not found.');
    }
    return doc as TDocument | null;
  }

  async findById(
    id: string | Types.ObjectId,
    projection?: ProjectionType<TDocument>,
  ): Promise<TDocument> {
    return this.findOne(
      { _id: new Types.ObjectId(String(id)) } as FilterQuery<TDocument>,
      projection,
    ) as Promise<TDocument>;
  }

  async find(
    filterQuery?: FilterQuery<TDocument>,
    projection?: ProjectionType<TDocument>,
    options?: QueryOptions<TDocument>,
  ): Promise<TDocument[]> {
    return this.model.find(
      filterQuery ?? {},
      projection ?? {},
      { lean: true, ...options },
    ) as unknown as TDocument[];
  }

  // ── Update ─────────────────────────────────────────────────────────────────

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options?: QueryOptions<TDocument> & { throwIfNotFound?: boolean },
  ): Promise<TDocument> {
    const { throwIfNotFound = true, ...queryOptions } = options ?? {};
    const doc = await this.model
      .findOneAndUpdate(filterQuery, update, {
        lean: true,
        new: true,
        ...queryOptions,
      })
      .exec();

    if (!doc && throwIfNotFound) {
      throw new NotFoundException('Record not found.');
    }
    return doc as TDocument;
  }

  async updateMany(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ) {
    return this.model.updateMany(filterQuery, update);
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async deleteOne(filterQuery: FilterQuery<TDocument>) {
    const result = await this.model.deleteOne(filterQuery);
    if (result.deletedCount === 0) {
      throw new NotFoundException('Record not found.');
    }
    return result;
  }

  async deleteMany(filterQuery: FilterQuery<TDocument>) {
    return this.model.deleteMany(filterQuery);
  }

  // ── Paginate ───────────────────────────────────────────────────────────────

  async paginate({
    filterQuery = {},
    page = 1,
    limit = 10,
    pipelines = [],
    sortBy = 'createdAt',
    sortOrder = -1,
  }: {
    filterQuery?: FilterQuery<TDocument>;
    page?: number;
    limit?: number;
    pipelines?: PipelineStage[];
    sortBy?: string;
    sortOrder?: 1 | -1;
  }): Promise<{ data: TDocument[]; total: number; page: number; pages: number }> {
    page = Number(page);
    limit = Number(limit);

    const [result] = await this.model.aggregate([
      { $match: filterQuery },
      { $sort: { [sortBy]: sortOrder } },
      ...pipelines,
      {
        $facet: {
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          total: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          data: 1,
          total: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
        },
      },
    ]);

    return {
      data: (result?.data ?? []) as TDocument[],
      total: result?.total ?? 0,
      page,
      pages: Math.ceil((result?.total ?? 0) / limit),
    };
  }

  // ── Aggregate ──────────────────────────────────────────────────────────────

  async aggregate(
    pipeline: PipelineStage[],
    options?: AggregateOptions,
  ): Promise<any[]> {
    return this.model.aggregate(pipeline, options);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  async count(filterQuery?: FilterQuery<TDocument>): Promise<number> {
    return this.model.countDocuments(filterQuery ?? {});
  }

  async exists(filterQuery: FilterQuery<TDocument>): Promise<boolean> {
    const count = await this.model.countDocuments(filterQuery);
    return count > 0;
  }

  async startSession(): Promise<ClientSession> {
    return this.connection.startSession();
  }
}
