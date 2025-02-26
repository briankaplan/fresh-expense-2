import Dexie from 'dexie';
import { Password, Batch, SecurityMetric } from '../../types';
import { AppError, ErrorCodes } from '../../utils/error';

class PasswordDatabase extends Dexie {
  passwords!: Dexie.Table<Password, number>;
  batches!: Dexie.Table<Batch, number>;
  securityMetrics!: Dexie.Table<SecurityMetric, number>;

  constructor() {
    super('PasswordCleanupDB');
    
    this.version(1).stores({
      passwords: '++id, website, username, batchNumber, status, priority, importance, lastModified, breached',
      batches: '++batchNumber, totalPasswords, completed, deleted, skipped, pending, inProgress, startTime, completionTime',
      securityMetrics: '++id, timestamp'
    });
  }
}

export class DatabaseService {
  private db: PasswordDatabase;

  constructor() {
    this.db = new PasswordDatabase();
  }

  async initialize(): Promise<void> {
    try {
      await this.db.open();
    } catch (error) {
      throw new AppError('Failed to initialize database', ErrorCodes.DATABASE_ERROR, error);
    }
  }

  // Password operations
  async getAllPasswords(): Promise<Password[]> {
    return this.db.passwords.toArray();
  }

  async savePassword(password: Password): Promise<number> {
    return this.db.passwords.add(password);
  }

  // Batch operations
  async getBatch(batchNumber: number): Promise<Batch | undefined> {
    return this.db.batches.get(batchNumber);
  }

  async updateBatch(batch: Batch): Promise<void> {
    await this.db.batches.put(batch);
  }
} 