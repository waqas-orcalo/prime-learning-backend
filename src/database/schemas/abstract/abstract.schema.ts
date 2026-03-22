import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

/**
 * AbstractSchema
 * ────────────────────────────────────────────────────────────────────────────
 * Base Mongoose document. Every schema extends this to inherit _id typing.
 *
 * Inspired by: AAC-BE-DEV-001 › libs/shared/src/schema/abstract-repo/abstract.schema.ts
 */
@Schema()
export class AbstractSchema {
  @Prop({ type: SchemaTypes.ObjectId })
  _id?: Types.ObjectId;
}
