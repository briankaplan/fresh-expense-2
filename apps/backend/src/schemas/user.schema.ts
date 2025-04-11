import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  collection: 'users',
  toJSON: {
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      return ret;
    }
  }
})
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: 'user' })
  role: 'admin' | 'user';

  @Prop({ type: Object })
  preferences: {
    theme?: 'light' | 'dark';
    currency?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
    };
  };

  @Prop({ type: [String], default: [] })
  linkedAccounts: string[];

  @Prop()
  lastLoginAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ isEmailVerified: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
}); 