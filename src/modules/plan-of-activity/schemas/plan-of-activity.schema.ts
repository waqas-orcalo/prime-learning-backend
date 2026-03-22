import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';
import { SessionStatus } from '../../../common/constants/enums.constant';

export interface TrainingSession {
  sessionNumber: number;
  date: Date;
  topic: string;
  status: SessionStatus;
  trainerNotes?: string;
}

@Schema({ timestamps: true, collection: 'plans_of_activity' })
export class PlanOfActivity extends AbstractSchema {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  learnerId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  trainerId: Types.ObjectId;

  @Prop({ required: true })
  programmeTitle: string;

  @Prop()
  programmeCode?: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  expectedEndDate: Date;

  /** Scheduled training sessions */
  @Prop({ type: [Object], default: [] })
  trainingSessions: TrainingSession[];

  /** Learner signed */
  @Prop({ default: false })
  learnerSigned: boolean;

  @Prop()
  learnerSignedAt?: Date;

  /** Trainer signed */
  @Prop({ default: false })
  trainerSigned: boolean;

  @Prop()
  trainerSignedAt?: Date;

  /** IQA signed */
  @Prop({ default: false })
  iqaSigned: boolean;

  @Prop()
  iqaSignedAt?: Date;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const PlanOfActivitySchema = SchemaFactory.createForClass(PlanOfActivity);
