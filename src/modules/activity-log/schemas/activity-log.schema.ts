import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';
import {
  ActivityLogAction,
  ActivityLogModule,
} from '../../../common/constants/enums.constant';

@Schema({ timestamps: true, collection: 'activity_logs' })
export class ActivityLog extends AbstractSchema {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  performedBy: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  targetUser?: Types.ObjectId;

  @Prop({ enum: ActivityLogAction, required: true })
  action: ActivityLogAction;

  @Prop({ enum: ActivityLogModule, required: true })
  module: ActivityLogModule;

  @Prop()
  resourceId?: string;

  @Prop()
  description?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);

ActivityLogSchema.index({ performedBy: 1, createdAt: -1 });
ActivityLogSchema.index({ module: 1, action: 1 });
