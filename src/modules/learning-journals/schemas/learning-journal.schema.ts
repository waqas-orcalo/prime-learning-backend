import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';
import { JournalPrivacy } from '../../../common/constants/enums.constant';

@Schema({
  timestamps: true,
  collection: 'learning_journals',
  toJSON: {
    virtuals: true,
    transform: (_doc: any, ret: any) => {
      ret.id = ret._id?.toString();
      delete ret.__v;
      return ret;
    },
  },
})
export class LearningJournal extends AbstractSchema {
  /** Optional: link this journal entry to a specific learning activity */
  @Prop({ type: SchemaTypes.ObjectId, ref: 'LearningActivity' })
  learningActivityId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true, default: '' })
  category: string;

  @Prop({ required: true })
  date: string;

  @Prop({ default: '' })
  timeHH: string;

  @Prop({ default: '' })
  timeMM: string;

  @Prop({ enum: ['AM', 'PM'], default: 'AM' })
  amPm: string;

  @Prop({ default: '' })
  durationHH: string;

  @Prop({ default: '' })
  durationMM: string;

  @Prop({ default: false })
  offJob: boolean;

  @Prop({ default: false })
  onJob: boolean;

  @Prop({ default: '' })
  reflection: string;

  @Prop({ enum: JournalPrivacy, default: JournalPrivacy.ONLY_ME })
  privacy: JournalPrivacy;

  @Prop({ type: [String], default: [] })
  files: string[];

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const LearningJournalSchema =
  SchemaFactory.createForClass(LearningJournal);
