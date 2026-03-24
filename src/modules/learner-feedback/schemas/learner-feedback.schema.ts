import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';

export type LearnerFeedbackDocument = HydratedDocument<LearnerFeedback>;

@Schema({ timestamps: true, collection: 'learner_feedback_forms' })
export class LearnerFeedback extends AbstractSchema {
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

  // ── Training Feedback fields ──────────────────────────────────────────────────
  @Prop({ default: '' }) trainersName: string;
  @Prop({ default: '' }) keyPoint: string;
  @Prop({ default: '' }) useSkillsImpact: string;
  @Prop({ default: '' }) moreInfoOn: string;
  @Prop({ enum: ['Yes', 'No', ''], default: '' }) completedJournal: string;
  @Prop({ default: '' }) ifNoWhyNot: string;
  @Prop({ default: '' }) improvementSuggestion: string;

  // ── Signatures ────────────────────────────────────────────────────────────────
  @Prop({ default: false }) learnerSigned: boolean;
  @Prop({ default: null })  learnerSignedAt: Date | null;

  @Prop({ default: false }) trainerSigned: boolean;
  @Prop({ default: null })  trainerSignedAt: Date | null;

  // ── Soft-delete ───────────────────────────────────────────────────────────────
  @Prop({ default: false }) isDeleted: boolean;
}

export const LearnerFeedbackSchema = SchemaFactory.createForClass(LearnerFeedback);

LearnerFeedbackSchema.index({ learnerId: 1, isDeleted: 1 });
LearnerFeedbackSchema.index({ trainerId: 1 });
LearnerFeedbackSchema.index({ createdAt: -1 });
