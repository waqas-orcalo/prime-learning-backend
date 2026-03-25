import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AbstractSchema } from '../../../database/schemas/abstract/abstract.schema';
import { UserRole, UserStatus } from '../../../common/constants/enums.constant';

export type UserDocument = HydratedDocument<User>;

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

  // ── Presence / Set Status ─────────────────────────────────────────────────
  @Prop({ default: 'Online' })
  presenceStatus: string;

  @Prop({ default: true })
  showOnlineStatus: boolean;

  @Prop({ default: '' })
  oooMessage: string;

  // ── Extended profile fields ───────────────────────────────────────────────
  @Prop({ default: null })
  pronouns: string | null;

  @Prop({ default: null })
  landline: string | null;

  @Prop({ default: null })
  mobile: string | null;

  @Prop({ default: null })
  skype: string | null;

  @Prop({ default: null })
  website: string | null;

  @Prop({ default: null })
  workplace: string | null;

  @Prop({ default: null })
  address: string | null;

  @Prop({ default: 'UTC' })
  timezone: string | null;

  @Prop({ default: null })
  homeAddress: string | null;

  // ── Trainer assignment ────────────────────────────────────────────────────
  /** The trainer (TRAINER role user) this learner is assigned to */
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedTrainerId: Types.ObjectId | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
