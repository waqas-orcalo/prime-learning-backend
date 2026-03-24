import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';

export type ExitReviewDocument = HydratedDocument<ExitReview>;

@Schema({ timestamps: true, collection: 'exit_review_forms' })
export class ExitReview extends AbstractSchema {
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

  // ── Learner Name & Start Date ─────────────────────────────────────────────────
  @Prop({ default: '' }) learnersName: string;
  @Prop({ default: null }) startDate: Date | null;

  // ── Programme Evaluation answers ─────────────────────────────────────────────
  // Keys: pe_0_0 … pe_4_1 (5 pairs × 2 questions) plus "answerLast"
  @Prop({ type: Map, of: String, default: {} })
  answers: Map<string, string>;

  @Prop({ default: '' })
  answerLast: string;

  // ── Signatures ────────────────────────────────────────────────────────────────
  @Prop({ default: false }) learnerSigned: boolean;
  @Prop({ default: null })  learnerSignedAt: Date | null;

  @Prop({ default: false }) trainerSigned: boolean;
  @Prop({ default: null })  trainerSignedAt: Date | null;

  // ── Soft-delete ───────────────────────────────────────────────────────────────
  @Prop({ default: false }) isDeleted: boolean;
}

export const ExitReviewSchema = SchemaFactory.createForClass(ExitReview);

ExitReviewSchema.index({ learnerId: 1, isDeleted: 1 });
ExitReviewSchema.index({ trainerId: 1 });
ExitReviewSchema.index({ createdAt: -1 });
