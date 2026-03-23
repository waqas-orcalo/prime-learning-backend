import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';
import { CriteriaType } from '../../../common/constants/enums.constant';

@Schema({ timestamps: true, collection: 'criteria' })
export class Criteria extends AbstractSchema {
  /** e.g. K1, S2, B3 */
  @Prop({ required: true, trim: true, unique: true })
  code: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ enum: CriteriaType, default: CriteriaType.KNOWLEDGE })
  type: CriteriaType;

  @Prop({ default: true })
  isActive: boolean;
}

export const CriteriaSchema = SchemaFactory.createForClass(Criteria);
