import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';

export type GroupDocument = HydratedDocument<Group>;

@Schema({ timestamps: true, collection: 'groups' })
export class Group extends AbstractSchema {
  @Prop({ required: true, trim: true }) name: string;
  @Prop({ default: '' }) description: string;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] }) members: Types.ObjectId[];
  @Prop({ type: Types.ObjectId, ref: 'User', default: null }) createdBy: Types.ObjectId;
  @Prop({ default: false }) isDeleted: boolean;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
