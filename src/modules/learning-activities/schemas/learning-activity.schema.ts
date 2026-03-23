import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';
import {
  ActionRequiredBy,
  ActivityMethod,
  ActivityType,
  EvidenceRecording,
  TaskStatus,
} from '../../../common/constants/enums.constant';

@Schema({ timestamps: true, collection: 'learning_activities' })
export class LearningActivity extends AbstractSchema {
  /** Human-readable reference e.g. LA001 */
  @Prop({ trim: true })
  ref?: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ enum: ActivityMethod, default: ActivityMethod.ASSIGNMENT })
  method: ActivityMethod;

  @Prop({ enum: ActivityType })
  type?: ActivityType;

  @Prop({ enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  /** Date of the activity (stored as string DD/MM/YYYY or ISO) */
  @Prop()
  activityDate?: string;

  /** Trainer time in minutes */
  @Prop({ default: 0 })
  trainerTimeMinutes: number;

  /** Learner time in minutes */
  @Prop({ default: 0 })
  learnerTimeMinutes: number;

  /** Reference to a Plan of Activity document (string ref) */
  @Prop({ trim: true })
  planOfActivityRef?: string;

  @Prop({ enum: ActionRequiredBy, default: ActionRequiredBy.LEARNER })
  actionRequiredBy: ActionRequiredBy;

  @Prop({ default: false })
  addToShowcase: boolean;

  @Prop({ enum: EvidenceRecording, default: EvidenceRecording.HOLISTIC })
  evidenceRecording: EvidenceRecording;

  /** Off-The-Job hours (kept for backward compat) */
  @Prop({ default: 0 })
  offTheJobHours: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  assignedTo?: Types.ObjectId;

  /** The learner this activity belongs to */
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  learnerId?: Types.ObjectId;

  @Prop()
  dueDate?: Date;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const LearningActivitySchema =
  SchemaFactory.createForClass(LearningActivity);
