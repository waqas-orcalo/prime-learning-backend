import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';

export class FileAttachment {
  name: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

@Schema({ timestamps: true, collection: 'evidence' })
export class Evidence extends AbstractSchema {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'LearningActivity', required: true })
  learningActivityId: Types.ObjectId;

  /** Rich text HTML / plain text content */
  @Prop({ default: '' })
  content: string;

  /** File attachments (stored as JSON objects) */
  @Prop({ type: [Object], default: [] })
  files: FileAttachment[];

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const EvidenceSchema = SchemaFactory.createForClass(Evidence);
