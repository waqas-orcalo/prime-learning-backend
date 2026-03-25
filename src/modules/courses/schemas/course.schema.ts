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
  /** Trainers explicitly given access to this course by an admin */
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] }) assignedTrainers: Types.ObjectId[];
  @Prop({
    type: [{
      name: String,
      slides: [{ content: String }],
      quiz: {
        passingScore: { type: Number, default: 70 },
        questions: [{ question: String, options: [String], correctIndex: Number, explanation: String }],
      },
    }],
    default: [],
  })
  courseModules: {
    name: string;
    slides: { content: string }[];
    quiz?: {
      passingScore?: number;
      questions: { question: string; options: string[]; correctIndex: number; explanation?: string }[];
    };
  }[];
  @Prop({ default: false }) isDeleted: boolean;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

CourseSchema.index({ createdBy: 1, isDeleted: 1 });
CourseSchema.index({ assignedTrainers: 1, isDeleted: 1 });
