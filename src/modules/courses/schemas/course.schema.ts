import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';
import { CourseStatus } from '../../../common/constants/enums.constant';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ timestamps: true, collection: 'courses' })
export class Course extends AbstractSchema {
  @Prop({ required: true, trim: true }) title: string;
  @Prop({ default: '' }) description: string;
  @Prop({ default: 'General' }) category: string;
  @Prop({ default: 0 }) modules: number;
  @Prop({ default: '0h' }) duration: string;
  @Prop({ enum: CourseStatus, default: CourseStatus.DRAFT }) status: CourseStatus;
  @Prop({ default: '📘' }) thumbnailEmoji: string;
  @Prop({ type: Types.ObjectId, ref: 'User', default: null }) createdBy: Types.ObjectId;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] }) enrolledUsers: Types.ObjectId[];
  @Prop({
    type: [{ name: String, slides: [{ content: String }] }],
    default: [],
  })
  courseModules: { name: string; slides: { content: string }[] }[];
  @Prop({ default: false }) isDeleted: boolean;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
