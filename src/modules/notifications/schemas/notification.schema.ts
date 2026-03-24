import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';

export type NotificationDocument = HydratedDocument<Notification>;

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  COURSE_ENROLLED = 'COURSE_ENROLLED',
}

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification extends AbstractSchema {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) userId: Types.ObjectId;
  @Prop({ type: String, enum: Object.values(NotificationType), required: true }) type: string;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) message: string;
  @Prop({ default: false }) read: boolean;
  @Prop({ default: false }) isDeleted: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
