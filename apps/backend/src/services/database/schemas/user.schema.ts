import { BaseSchema } from './base.schema';

export interface UserSchema extends BaseSchema {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    language?: string;
  };
}

export const USER_COLLECTION = 'users'; 