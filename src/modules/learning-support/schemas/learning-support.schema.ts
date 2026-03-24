import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';

export type LearningSupportDocument = HydratedDocument<LearningSupport>;

@Schema({ timestamps: true, collection: 'learning_support_forms' })
export class LearningSupport extends AbstractSchema {
  // ── Meta ─────────────────────────────────────────────────────────────────────
  @Prop({ required: true, trim: true })
  formName: string;

  @Prop({ required: true, trim: true })
  instanceName: string;

  // ── Linked users ─────────────────────────────────────────────────────────────
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  learnerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  trainerId: Types.ObjectId | null;

  // ── Section 1: Learning Support Document (optional attachment URL) ────────────
  @Prop({ default: '' }) attachmentUrl: string;
  @Prop({ default: '' }) attachmentName: string;

  // ── Section 2: Review schedule ────────────────────────────────────────────────
  @Prop({ enum: ['Yes/True', 'No/False'], default: 'No/False' }) monthlyReview: string;
  @Prop({ enum: ['Yes/True', 'No/False'], default: 'No/False' }) threeMonthlyReview: string;

  // ── Section 3: Monthly Support Review ────────────────────────────────────────
  @Prop({ default: '' }) changesNotes: string;
  @Prop({ default: '' }) activityTracker: string;
  @Prop({ default: '' }) reasonForStopping: string;

  // ── Section 4: Tutor Confirmation ────────────────────────────────────────────
  @Prop({ enum: ['Yes/True', 'No/False'], default: 'No/False' }) tutorConfirmationA: string;
  @Prop({ enum: ['Yes/True', 'No/False'], default: 'No/False' }) tutorConfirmationB: string;

  // ── Section 5: Learner Confirmation ──────────────────────────────────────────
  @Prop({ enum: ['Yes/True', 'No/False'], default: 'No/False' }) learnerConfirmation: string;

  // ── Signatures ────────────────────────────────────────────────────────────────
  @Prop({ default: false }) learnerSigned: boolean;
  @Prop({ default: null })  learnerSignedAt: Date | null;

  @Prop({ default: false }) trainerSigned: boolean;
  @Prop({ default: null })  trainerSignedAt: Date | null;

  // ── Soft-delete ───────────────────────────────────────────────────────────────
  @Prop({ default: false }) isDeleted: boolean;
}

export const LearningSupportSchema = SchemaFactory.createForClass(LearningSupport);

LearningSupportSchema.index({ learnerId: 1, isDeleted: 1 });
LearningSupportSchema.index({ trainerId: 1 });
LearningSupportSchema.index({ createdAt: -1 });
