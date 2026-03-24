import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../../database/repositories/base/abstract.repository';
import { Notification } from '../schemas/notification.schema';

@Injectable()
export class NotificationRepository extends AbstractRepository<Notification> {
  protected readonly logger = new Logger(NotificationRepository.name);
  constructor(
    @InjectModel(Notification.name) private readonly notificationModel: Model<Notification>,
    @InjectConnection() connection: Connection,
  ) {
    super(notificationModel, connection);
  }
}
