import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as argon2 from 'argon2';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      delete ret['password'];
      delete ret['refreshTokens'];
      return ret;
    },
  },
})
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  picture?: string;

  @Prop()
  googleId?: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: Date })
  lastLoginAt?: Date;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: [String], default: [] })
  refreshTokens!: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function(next) {
  try {
    if (this.isModified('password')) {
      this['password'] = await argon2.hash(this['password']);
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

UserSchema.methods['comparePassword'] = async function(candidatePassword: string): Promise<boolean> {
  return argon2.verify(this['password'], candidatePassword);
}; 