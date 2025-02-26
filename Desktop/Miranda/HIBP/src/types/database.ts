// Database related types
export interface PasswordEntry {
  id?: number;
  website: string;
  url: string;
  username: string;
  priority: number;
  importance: number;
  status: PasswordStatus;
  batchNumber: number;
}

export interface BatchEntry {
  batchNumber: number;
  totalPasswords: number;
  completed: number;
  deleted: number;
  skipped: number;
  pending: number;
  inProgress: number;
}

export type PasswordStatus = 'pending' | 'in-progress' | 'completed' | 'deleted' | 'skipped';

export interface SecurityMetric {
  id?: number;
  timestamp: Date;
  totalPasswords: number;
  weakPasswords: number;
  breachedPasswords: number;
  averageStrength: number;
  riskScore: number;
}

export interface DatabaseStats {
  totalPasswords: number;
  completedBatches: number;
  pendingBatches: number;
  lastSync: Date;
}

export interface DatabaseConfig {
  version: number;
  lastMigration?: Date;
  encryptionEnabled: boolean;
} 