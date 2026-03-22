import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';
import { SignatureRole } from '../../../common/constants/enums.constant';

export interface KscItem {
  unitCode: string;
  description: string;
  achieved: boolean;
}

export interface SignatureBlock {
  role: SignatureRole;
  name: string;
  date?: Date;
  signed: boolean;
  signatureData?: string;
}

@Schema({ timestamps: true, collection: 'progress_reviews' })
export class ProgressReview extends AbstractSchema {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  learnerId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  trainerId: Types.ObjectId;

  @Prop({ required: true })
  reviewDate: Date;

  @Prop()
  notes?: string;

  /** Completed unit IDs */
  @Prop({ type: [SchemaTypes.ObjectId], ref: 'LearningActivity', default: [] })
  completedUnits: Types.ObjectId[];

  /** KSC items reviewed */
  @Prop({ type: [Object], default: [] })
  kscItems: KscItem[];

  /** Signatures from learner, trainer, IQA */
  @Prop({ type: [Object], default: [] })
  signatures: SignatureBlock[];

  @Prop({ default: false })
  isDeleted: boolean;
}

export const ProgressReviewSchema = SchemaFactory.createForClass(ProgressReview);
