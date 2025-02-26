export interface Password {
  id?: number;
  website: string;
  username: string;
  password: string;
  url?: string;
  strength: PasswordStrength;
  status: PasswordStatus;
  batchNumber?: number;
  priority: number;
  importance: number;
  lastModified: Date;
  breached?: boolean;
  notes?: string;
}

export type PasswordStrength = 'weak' | 'medium' | 'strong';
export type PasswordStatus = 'pending' | 'in-progress' | 'completed' | 'deleted' | 'skipped'; 