import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';
import { ResourceType, ResourceVisibility } from '../../../common/constants/enums.constant';

export type ResourceDocument = HydratedDocument<Resource>;

@Schema({ timestamps: true, collection: 'resources' })
export class Resource extends AbstractSchema {
  @Prop({ required: true, trim: true }) title: string;
  @Prop({ default: '' }) description: string;
  @Prop({ enum: ResourceType, required: true }) type: ResourceType;
  @Prop({ default: 'General', trim: true }) category: string;
  @Prop({ type: [String], default: [] }) tags: string[];
  @Prop({ enum: ResourceVisibility, default: ResourceVisibility.ALL }) visibility: ResourceVisibility;

  // File info (for uploaded assets)
  @Prop({ default: null }) fileUrl: string | null;
  @Prop({ default: null }) fileName: string | null;
  @Prop({ default: null }) fileSize: number | null;
  @Prop({ default: null }) mimeType: string | null;

  // External link
  @Prop({ default: null }) externalUrl: string | null;

  // Engagement tracking
  @Prop({ default: 0 }) views: number;
  @Prop({ default: 0 }) downloads: number;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] }) bookmarkedBy: Types.ObjectId[];

  // Meta
  @Prop({ default: false }) featured: boolean;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) uploadedBy: Types.ObjectId;
  @Prop({ default: false }) isDeleted: boolean;

  /** Users this resource has been explicitly shared with */
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] }) sharedWith: Types.ObjectId[];
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);

// Indexes for fast filtering
ResourceSchema.index({ type: 1, isDeleted: 1 });
ResourceSchema.index({ uploadedBy: 1 });
ResourceSchema.index({ featured: 1, isDeleted: 1 });
ResourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
ResourceSchema.index({ sharedWith: 1 });
