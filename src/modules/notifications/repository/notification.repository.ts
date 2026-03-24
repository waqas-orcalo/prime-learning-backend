import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, UpdateQuery } from 'mongoose';
import { Notification } from '../schemas/notification.schema';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectModel(Notification.name) private readonly model: Model<Notification>,
  ) {}

  async create(doc: Partial<Notification>): Promise<Notification> {
    const created = new this.model(doc);
    return created.save() as unknown as Notification;
  }

  async find(
    filter: FilterQuery<Notification>,
    options?: { sort?: any; limit?: number },
  ): Promise<Notification[]> {
    let query = this.model.find(filter).lean();
    if (options?.sort) query = query.sort(options.sort);
    if (options?.limit) query = query.limit(options.limit);
    return query as unknown as Notification[];
  }

  async findOneAndUpdate(
    filter: FilterQuery<Notification>,
    update: UpdateQuery<Notification>,
  ): Promise<Notification | null> {
    return this.model
      .findOneAndUpdate(filter, update, { new: true, lean: true })
      .exec() as unknown as Notification | null;
  }

  async updateMany(
    filter: FilterQuery<Notification>,
    update: UpdateQuery<Notification>,
  ) {
    return this.model.updateMany(filter, update);
  }
}
