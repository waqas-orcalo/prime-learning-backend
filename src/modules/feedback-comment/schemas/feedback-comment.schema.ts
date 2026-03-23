import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';
import { FeedbackCommentType } from '../../../common/constants/enums.constant';

@Schema({ timestamps: true, collection: 'feedback_comments' })
export class FeedbackComment extends AbstractSchema {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'LearningActivity', required: true })
  learningActivityId: Types.ObjectId;

  @Prop({ default: '' })
  content: string;

  @Prop({ enum: FeedbackCommentType, default: FeedbackCommentType.COMMENT })
  type: FeedbackCommentType;

  @Prop({ type: [String], default: [] })
  files: string[];

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const FeedbackCommentSchema = SchemaFactory.createForClass(FeedbackComment);
