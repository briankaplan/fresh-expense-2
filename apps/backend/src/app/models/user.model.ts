import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, CallbackError } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import * as crypto from 'crypto';

export type UserDocument = User & Document;

type PublicProfile = Omit<User, 'password'> & { _id: string };

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  })
  email!: string;

  @Prop({
    required: true,
    minlength: 8,
    select: false,
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
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hash password before saving
UserSchema.pre('save', async function (next: (err?: CallbackError) => void) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this['password'] = await bcrypt.hash(this['password'], salt);
    next();
  } catch (err) {
    next(err as CallbackError);
  }
});

// Method to compare passwords
UserSchema.methods['comparePassword'] = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this['password']);
};

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
