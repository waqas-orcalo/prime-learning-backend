import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';

export interface ScoreEntry {
  criterionKey: string;   // e.g. "1-0"  (subSectionId-criterionIndex)
  criterionLabel: string; // full text of the criterion
  section: string;        // 'skills' | 'knowledge' | 'behaviours'
  subSection: string;     // e.g. '1' (IT) | '2' (Record and Document)
  previousScore: number;  // carried from previous scorecard (0 if first)
  currentScore: number;   // learner-entered 1–10
}

@Schema({ timestamps: true, collection: 'scorecards' })
export class Scorecard extends AbstractSchema {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  learnerId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: () => new Date() })
  date: Date;

  @Prop({ default: false })
  submitted: boolean;

  /** All scored criteria for this scorecard */
  @Prop({ type: [Object], default: [] })
  scores: ScoreEntry[];

  @Prop({ default: '' })
  notes: string;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const ScorecardSchema = SchemaFactory.createForClass(Scorecard);
