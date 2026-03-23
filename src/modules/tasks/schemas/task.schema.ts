import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';
import {
  TaskPriority,
  TaskStatus,
} from '../../../common/constants/enums.constant';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true, collection: 'tasks' })
export class Task extends AbstractSchema {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Prop({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', default: null })
  assignedTo: Types.ObjectId | null;

  @Prop({ default: null })
  dueDate: Date | null;

  @Prop({ default: '' })
  reference: string;

  @Prop({ default: '' })
  primaryMethod: string;

  @Prop({ type: [String], default: [] })
  secondaryMethods: string[];

  /** Learner's evidence submission text */
  @Prop({ default: '' })
  evidence: string;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
