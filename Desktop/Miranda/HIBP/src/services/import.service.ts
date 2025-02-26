import Papa from 'papaparse';
import { db } from './database.service';
import { STATUS, CONFIG } from '../config/constants';
import type { PasswordEntry, BatchEntry } from '../types/database';

export class ImportService {
  static async processCSVFile(file: File): Promise<void> {
    try {
      const text = await file.text();
      return new Promise((resolve, reject) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            await this.importPasswords(results.data);
            resolve();
          },
          error: (error) => reject(error)
        });
      });
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }

  private static async importPasswords(data: any[]): Promise<void> {
    await db.transaction('rw', [db.passwords, db.batches], async () => {
      // Clear existing data
      await db.passwords.clear();
      await db.batches.clear();
      
      const passwords = this.formatPasswordData(data);
      const batches = this.createBatches(passwords);
      
      await db.passwords.bulkAdd(passwords);
      await db.batches.bulkAdd(batches);
    });
  }

  private static formatPasswordData(data: any[]): PasswordEntry[] {
    return data.map((row, index) => ({
      website: row.Website || row.website || '',
      url: row.URL || row.url || '',
      username: row.Username || row.username || '',
      priority: parseInt(row.Priority) || 3,
      importance: parseInt(row.Importance) || 1,
      status: STATUS.PENDING,
      batchNumber: Math.floor(index / CONFIG.BATCH_SIZE) + 1
    }));
  }

  private static createBatches(passwords: PasswordEntry[]): BatchEntry[] {
    const batchCount = Math.ceil(passwords.length / CONFIG.BATCH_SIZE);
    
    return Array.from({ length: batchCount }, (_, i) => {
      const batchPasswords = passwords.filter(p => p.batchNumber === i + 1);
      return {
        batchNumber: i + 1,
        totalPasswords: batchPasswords.length,
        completed: 0,
        deleted: 0,
        skipped: 0,
        pending: batchPasswords.length,
        inProgress: 0
      };
    });
  }
} 