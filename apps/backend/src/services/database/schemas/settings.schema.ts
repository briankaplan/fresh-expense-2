import { BaseSchema } from './base.schema';

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

export interface BudgetSettings {
  defaultCurrency: string;
  defaultPeriod: 'monthly' | 'quarterly' | 'yearly';
  rolloverUnused: boolean;
  alertThreshold: number;
}

export interface SettingsSchema extends BaseSchema {
  userId: string;
  notifications: NotificationSettings;
  budget: BudgetSettings;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  currencyFormat: string;
  metadata?: {
    [key: string]: any;
  };
}

export const SETTINGS_COLLECTION = 'settings';
