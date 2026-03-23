import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';
import { TimesheetCategory } from '../../../common/constants/enums.constant';

@Schema({ timestamps: true, collection: 'timesheet_entries' })
export class TimesheetEntry extends AbstractSchema {
  /** Optional: link to a specific learning activity */
  @Prop({ type: SchemaTypes.ObjectId, ref: 'LearningActivity' })
  learningActivityId?: Types.ObjectId;

  @Prop({ enum: TimesheetCategory, required: true })
  category: TimesheetCategory;

  @Prop({ required: true })
  dateFrom: Date;

  @Prop({ required: true })
  dateTo: Date;

  @Prop({ default: '' })
  description: string;

  /** Duration in minutes */
  @Prop({ required: true, min: 1 })
  timeMinutes: number;

  @Prop({ default: false })
  offJob: boolean;

  /** The user who spent the time (learner or trainer) */
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  spentBy: Types.ObjectId;

  /** The user who recorded this entry */
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  recordedBy: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const TimesheetEntrySchema = SchemaFactory.createForClass(TimesheetEntry);
