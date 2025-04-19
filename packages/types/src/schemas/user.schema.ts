import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from './base.schema';
import { UserRole, UserStatus } from '../lib/types';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User extends BaseDocument {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ type: String })
  password?: string;

  @Prop({ type: String })
  phone?: string;

  @Prop({ type: String })
  avatar?: string;

  @Prop({ type: [String], default: ['user'] })
  roles!: string[];

  @Prop({ type: Boolean, default: false })
  isActive!: boolean;

  @Prop({ type: Date })
  lastLogin?: Date;

  @Prop({ type: [Types.ObjectId], ref: 'Company', default: [] })
  companies!: Types.ObjectId[];

  @Prop({ type: Object })
  preferences?: {
    language?: string;
    timezone?: string;
    currency?: string;
    [key: string]: any;
  };

  @Prop({ type: Object })
  metadata?: {
    [key: string]: any;
  };

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Prop({ type: Date })
  lastLoginAt?: Date;

  @Prop({ type: Date })
  passwordChangedAt?: Date;

  @Prop({ required: true, default: false })
  isVerified!: boolean;

  constructor(partial: Partial<User>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ companies: 1 });
UserSchema.index({ 'metadata.companyId': 1 });

// Virtuals and Methods
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.methods.isActive = function() {
  return this.status === UserStatus.ACTIVE;
};

UserSchema.methods.hasRole = function(role: UserRole) {
  return this.role === role;
};
