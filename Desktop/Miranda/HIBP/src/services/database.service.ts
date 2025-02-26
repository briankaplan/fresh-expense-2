import Dexie from 'dexie';
import { CONFIG } from '../config/constants';
import type { PasswordEntry, BatchEntry } from '../types/database';

class PasswordDatabase extends Dexie {
  passwords!: Dexie.Table<PasswordEntry, number>;
  batches!: Dexie.Table<BatchEntry, number>;

  constructor() {
    super(CONFIG.DB_NAME);
    
    this.version(CONFIG.DB_VERSION).stores({
      passwords: '++id, website, username, batchNumber, status, priority, importance',
      batches: '++batchNumber, totalPasswords, completed, deleted, skipped, pending, inProgress'
    });
  }
}

export const db = new PasswordDatabase(); 