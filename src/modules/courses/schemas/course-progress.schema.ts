import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';

export type CourseProgressDocument = HydratedDocument<CourseProgress>;

@Schema({ timestamps: true, collection: 'course_progress' })
export class CourseProgress extends AbstractSchema {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) userId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true }) courseId: Types.ObjectId;
  // Each key is "moduleIndex-slideIndex", e.g. "0-0", "0-1", "1-0"
  @Prop({ type: [String], default: [] }) completedSlideKeys: string[];
}

export const CourseProgressSchema = SchemaFactory.createForClass(CourseProgress);
