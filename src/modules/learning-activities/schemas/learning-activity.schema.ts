import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';
import {
  ActivityMethod,
  ActivityType,
  TaskStatus,
} from '../../../common/constants/enums.constant';

@Schema({ timestamps: true, collection: 'learning_activities' })
export class LearningActivity extends AbstractSchema {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ enum: ActivityMethod, default: ActivityMethod.ONLINE_COURSE })
  method: ActivityMethod;

  @Prop({ enum: ActivityType })
  type?: ActivityType;

  @Prop({ enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  assignedTo?: Types.ObjectId;

  @Prop()
  dueDate?: Date;

  /** Off-The-Job hours */
  @Prop({ default: 0 })
  offTheJobHours: number;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const LearningActivitySchema =
  SchemaFactory.createForClass(LearningActivity);
