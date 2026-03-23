import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';
import { TransportMode, VisitType } from '../../../common/constants/enums.constant';

@Schema({ timestamps: true, collection: 'visits' })
export class Visit extends AbstractSchema {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'LearningActivity' })
  learningActivityId?: Types.ObjectId;

  @Prop({ enum: VisitType, required: true })
  visitType: VisitType;

  @Prop({ required: true })
  visitDate: Date;

  @Prop({ default: 0 })
  durationMinutes: number;

  @Prop({ default: 0 })
  travelTimeMinutes: number;

  @Prop({ enum: TransportMode })
  transportMode?: TransportMode;

  @Prop()
  startLocation?: string;

  @Prop()
  endLocation?: string;

  @Prop()
  notes?: string;

  /** Learner signature (base64 or URL) */
  @Prop()
  learnerSignature?: string;

  @Prop()
  learnerSignedAt?: Date;

  /** Trainer signature */
  @Prop()
  trainerSignature?: string;

  @Prop()
  trainerSignedAt?: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  learnerId?: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);
