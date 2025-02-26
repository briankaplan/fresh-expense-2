import { db } from '../services/database.service';
import { STATUS } from '../config/constants';
import type { BatchEntry } from '../types/database';

export async function getCurrentBatch(): Promise<number> {
  const batches = await db.batches.toArray();
  for (const batch of batches) {
    if (batch.pending > 0 || batch.inProgress > 0) {
      return batch.batchNumber;
    }
  }
  return batches.length;
}

export async function getProgressStats() {
  const totalPasswords = await db.passwords.count();
  const completedPasswords = await db.passwords
    .where('status')
    .anyOf([STATUS.COMPLETED, STATUS.DELETED, STATUS.SKIPPED])
    .count();
    
  const progress = totalPasswords ? Math.round((completedPasswords / totalPasswords) * 100) : 0;
  
  return {
    total: totalPasswords,
    completed: completedPasswords,
    progress
  };
} 