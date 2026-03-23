import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';

@Schema({ timestamps: true, collection: 'declarations' })
export class Declaration extends AbstractSchema {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'LearningActivity', required: true, unique: true })
  learningActivityId: Types.ObjectId;

  @Prop({ default: false })
  learnerAgreed: boolean;

  @Prop()
  learnerSignedAt?: Date;

  /** Learner signature (base64 canvas data or URL) */
  @Prop()
  learnerSignature?: string;

  @Prop({ default: false })
  trainerAgreed: boolean;

  @Prop()
  trainerSignedAt?: Date;

  @Prop()
  trainerSignature?: string;

  @Prop({ default: false })
  agreedToTerms: boolean;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const DeclarationSchema = SchemaFactory.createForClass(Declaration);
