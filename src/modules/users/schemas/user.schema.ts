import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';
import { UserRole, UserStatus } from '../../../common/constants/enums.constant';

export type UserDocument = HydratedDocument<User>;

/**
 * User Schema
 * ────────────────────────────────────────────────────────────────────────────
 * Every schema extends AbstractSchema (provides _id), then adds its own fields.
 * The SchemaFactory creates the actual Mongoose schema used in MongooseModule.
 */
@Schema({ timestamps: true, collection: 'users' })
export class User extends AbstractSchema {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ enum: UserRole, default: UserRole.LEARNER })
  role: UserRole;

  @Prop({ enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Prop({ default: null })
  avatarUrl: string | null;

  @Prop({ default: null })
  phone: string | null;

  @Prop({ default: null })
  dateOfBirth: Date | null;

  @Prop({ default: null })
  organizationId: string | null;

  @Prop({ default: null })
  lastActivityAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
