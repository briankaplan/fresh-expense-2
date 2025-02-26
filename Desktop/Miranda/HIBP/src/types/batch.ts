export interface Batch {
  batchNumber: number;
  totalPasswords: number;
  completed: number;
  deleted: number;
  skipped: number;
  pending: number;
  inProgress: number;
  startTime?: Date;
  completionTime?: Date;
} 