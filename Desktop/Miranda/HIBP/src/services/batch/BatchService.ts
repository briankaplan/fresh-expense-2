import { Batch, Password } from '../../types';
import { DatabaseService } from '../database/DatabaseService';
import { AppError, ErrorCodes } from '../../utils/error';

export class BatchService {
  private databaseService: DatabaseService;

  constructor() {
    this.databaseService = new DatabaseService();
  }

  async createBatch(passwords: Password[]): Promise<Batch> {
    const batch: Batch = {
      batchNumber: await this.getNextBatchNumber(),
      totalPasswords: passwords.length,
      completed: 0,
      deleted: 0,
      skipped: 0,
      pending: passwords.length,
      inProgress: 0,
      startTime: new Date()
    };

    await this.databaseService.updateBatch(batch);
    return batch;
  }

  async updateBatchProgress(batchNumber: number, updates: Partial<Batch>): Promise<void> {
    const batch = await this.databaseService.getBatch(batchNumber);
    if (!batch) {
      throw new AppError('Batch not found', ErrorCodes.DATABASE_ERROR);
    }

    const updatedBatch = { ...batch, ...updates };
    await this.databaseService.updateBatch(updatedBatch);
  }

  private async getNextBatchNumber(): Promise<number> {
    const batches = await this.databaseService.getAllBatches();
    return Math.max(...batches.map(b => b.batchNumber), 0) + 1;
  }
} 