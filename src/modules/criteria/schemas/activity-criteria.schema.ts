import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';

@Schema({ timestamps: true, collection: 'activity_criteria' })
export class ActivityCriteria extends AbstractSchema {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'LearningActivity', required: true })
  learningActivityId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Criteria', required: true })
  criteriaId: Types.ObjectId;

  /** Evidence text specific to this criteria for this activity */
  @Prop({ default: '' })
  evidence: string;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const ActivityCriteriaSchema = SchemaFactory.createForClass(ActivityCriteria);
// Compound unique index: one criteria per activity
ActivityCriteriaSchema.index({ learningActivityId: 1, criteriaId: 1 }, { unique: true });
