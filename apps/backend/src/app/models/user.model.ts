import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, CallbackError } from 'mongoose';
import * as argon2 from 'argon2';
import { Exclude } from 'class-transformer';
import * as crypto from 'crypto';

export type UserDocument = User & Document;

type PublicProfile = Omit<User, 'password'> & { _id: string };

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      delete ret.password;
      delete ret.__v;
      return ret;
    },
  },
})
export class User extends Document {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  })
  email!: string;

  @Prop({
    required: true,
  })
  @Exclude()
  password!: string;

  @Prop({
    required: true,
    trim: true,
  })
  name!: string;

  @Prop({
    enum: ['user', 'admin'],
    default: 'user',
  })
  role!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  lastLogin?: Date;

  @Prop([
    {
      token: String,
      expiresAt: Date,
    },
  ])
  refreshTokens: Array<{
    token: string;
    expiresAt: Date;
  }> = [];

  @Prop({
    currency: {
      type: String,
      default: 'USD',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: false,
      },
    },
  })
  preferences: {
    currency: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
    };
  } = {
    currency: 'USD',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: false,
    },
  };

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop({ default: [] })
  roles: string[];

  @Prop({ default: Date.now })
  lastLoginAt: Date;

  @Prop()
  refreshToken?: string;

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return argon2.verify(this.password, candidatePassword);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next: (err?: CallbackError) => void) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    this['password'] = await argon2.hash(this['password']);
    next();
  } catch (err) {
    next(err as CallbackError);
  }
});

// Method to get public profile
UserSchema.methods['getPublicProfile'] = function (): PublicProfile {
  const userObject = this['toObject']();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Method to generate refresh token
UserSchema.methods['generateRefreshToken'] = function (): string {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Token expires in 7 days
  this['refreshTokens'].push({ token, expiresAt });
  return token;
};

// Method to cleanup expired refresh tokens
UserSchema.methods['cleanupRefreshTokens'] = function (): void {
  const now = new Date();
  this['refreshTokens'] = this['refreshTokens'].filter(
    (token: { expiresAt: Date }) => token.expiresAt > now
  );
};
