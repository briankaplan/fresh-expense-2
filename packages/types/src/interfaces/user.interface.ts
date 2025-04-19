import { Document } from 'mongoose';
import { UserRole, UserStatus } from '../lib/types';
import { Currency, DateFormat, TimeZone } from '../schemas/settings.schema';

export interface NotificationSettings {
  email: {
    enabled: boolean;
    frequency: 'instant' | 'daily' | 'weekly';
    types: string[];
  };
  push: {
    enabled: boolean;
    types: string[];
  };
  inApp: {
    enabled: boolean;
    types: string[];
  };
}

export interface BudgetSettings {
  defaultPeriod: 'monthly' | 'quarterly' | 'yearly';
  rolloverEnabled: boolean;
  rolloverPeriod: number;
  alertThreshold: number;
  alertFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface ExportSettings {
  format: 'csv' | 'excel' | 'pdf';
  includeReceipts: boolean;
  includeMetadata: boolean;
  compression: boolean;
  defaultPath: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginAttempts: number;
  allowedIPs: string[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  defaultView: 'dashboard' | 'transactions' | 'budget';
  pageSize: number;
  autoSave: boolean;
  tooltips: boolean;
}

export interface UserSettings {
  currency: Currency;
  dateFormat: DateFormat;
  timeZone: TimeZone;
  notifications?: NotificationSettings;
  budget?: BudgetSettings;
  export?: ExportSettings;
  security?: SecuritySettings;
  preferences?: UserPreferences;
  integrations?: {
    [key: string]: {
      enabled: boolean;
      config: Record<string, any>;
      lastSync?: Date;
      status?: string;
    };
  };
  backup?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    lastBackup?: Date;
    nextBackup?: Date;
    location: string;
    retention: number;
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  companies: string[];
  settings?: UserSettings;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface UserDocument extends Omit<User, 'id'>, Document {}

export interface UserContext {
  userId: string;
  email: string;
  role: string;
  companyId?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
} 