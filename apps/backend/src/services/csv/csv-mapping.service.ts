import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationService } from '../notification/notification.service';

interface CsvRecord {
  id?: string;
  date: string;
  merchant: string;
  amount: string;
  category?: string;
  description?: string;
  company?: string;
  csvRecordId?: string;
  receiptUrl?: string;
}

interface DbRecord {
  id: string;
  date: Date;
  merchant: string;
  amount: number;
  category: string | null;
  description: string | null;
  company: string;
  csvRecordId: string;
  receiptUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const VALID_COMPANIES = ['Down Home', 'Music City Rodeo', 'Personal'] as const;

@Injectable()
export class CsvMappingService {
  private readonly logger = new Logger(CsvMappingService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationService: NotificationService,
  ) {}

  generateCsvRecordId(record: CsvRecord): string {
    const content = `${record.date}-${record.merchant}-${record.amount}-${record.description || ''}`;
    const hash = Array.from(content).reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
    }, 0);
    
    return `csv-${Math.abs(hash).toString(36)}`;
  }

  isDuplicateRecord(record: CsvRecord, existingRecord: DbRecord): boolean {
    if (!existingRecord) return false;
    
    // Compare core fields
    const coreFields = ['date', 'merchant', 'amount', 'description'] as const;
    for (const field of coreFields) {
      if (field === 'date') {
        const recordDate = new Date(record.date);
        if (recordDate.getTime() !== existingRecord.date.getTime()) return false;
      } else if (field === 'amount') {
        if (parseFloat(record[field]) !== existingRecord[field]) return false;
      } else if (record[field] !== existingRecord[field]) {
        return false;
      }
    }
    
    return true;
  }

  csvToDb(csvRecord: CsvRecord, options: { checkDuplicates?: boolean; existingRecord?: DbRecord } = {}): DbRecord {
    const { checkDuplicates = false, existingRecord = null } = options;
    
    // Generate a unique ID if not provided
    const csvRecordId = csvRecord.csvRecordId || this.generateCsvRecordId(csvRecord);
    
    // Check for duplicates if requested
    if (checkDuplicates && existingRecord && this.isDuplicateRecord(csvRecord, existingRecord)) {
      throw new Error('Duplicate record detected');
    }

    const now = new Date();
    
    return {
      id: csvRecord.id || crypto.randomUUID(),
      date: new Date(csvRecord.date),
      merchant: csvRecord.merchant,
      amount: parseFloat(csvRecord.amount),
      category: csvRecord.category || null,
      description: csvRecord.description || null,
      company: csvRecord.company || 'Personal',
      csvRecordId,
      receiptUrl: csvRecord.receiptUrl || null,
      createdAt: now,
      updatedAt: now,
    };
  }

  dbToCsv(dbRecord: DbRecord): CsvRecord {
    return {
      id: dbRecord.id,
      date: dbRecord.date.toISOString().split('T')[0],
      merchant: dbRecord.merchant,
      amount: dbRecord.amount.toFixed(2),
      category: dbRecord.category || '',
      description: dbRecord.description || '',
      company: dbRecord.company,
      csvRecordId: dbRecord.csvRecordId,
      receiptUrl: dbRecord.receiptUrl || '',
    };
  }

  getCsvHeaders(): string[] {
    return ['id', 'date', 'merchant', 'amount', 'category', 'description', 'company', 'csvRecordId', 'receiptUrl'];
  }

  validateCsvRecord(record: CsvRecord): string | null {
    try {
      if (!record.id) return 'Missing id';
      if (!record.date || isNaN(new Date(record.date).getTime())) return 'Invalid date';
      if (!record.merchant) return 'Missing merchant';
      if (!record.amount || isNaN(parseFloat(record.amount))) return 'Invalid amount';
      if (record.company && !VALID_COMPANIES.includes(record.company as typeof VALID_COMPANIES[number])) {
        return `Invalid company. Must be one of: ${VALID_COMPANIES.join(', ')}`;
      }
      return null;
    } catch (error) {
      this.logger.error('Error validating CSV record:', error);
      return 'Error validating record';
    }
  }

  validateDbRecord(record: DbRecord): string | null {
    try {
      if (!record.id) return 'Missing id';
      if (!record.date || !(record.date instanceof Date)) return 'Invalid date';
      if (!record.merchant) return 'Missing merchant';
      if (typeof record.amount !== 'number') return 'Invalid amount';
      if (!record.csvRecordId) return 'Missing csvRecordId';
      if (!VALID_COMPANIES.includes(record.company as typeof VALID_COMPANIES[number])) {
        return `Invalid company. Must be one of: ${VALID_COMPANIES.join(', ')}`;
      }
      if (!record.createdAt || !(record.createdAt instanceof Date)) return 'Missing or invalid createdAt';
      if (!record.updatedAt || !(record.updatedAt instanceof Date)) return 'Missing or invalid updatedAt';
      return null;
    } catch (error) {
      this.logger.error('Error validating database record:', error);
      return 'Error validating record';
    }
  }

  async processCsvRecords(records: CsvRecord[], options: { checkDuplicates?: boolean; existingRecords?: DbRecord[] } = {}): Promise<DbRecord[]> {
    const { checkDuplicates = false, existingRecords = [] } = options;
    const processedRecords: DbRecord[] = [];
    const errors: string[] = [];

    for (const record of records) {
      try {
        // Validate CSV record
        const validationError = this.validateCsvRecord(record);
        if (validationError) {
          errors.push(`Record ${record.id || 'unknown'}: ${validationError}`);
          continue;
        }

        // Find existing record if checking for duplicates
        const existingRecord = checkDuplicates
          ? existingRecords.find(r => r.csvRecordId === record.csvRecordId) || undefined
          : undefined;

        // Convert to database format
        const dbRecord = this.csvToDb(record, { checkDuplicates, existingRecord });
        
        // Validate database record
        const dbValidationError = this.validateDbRecord(dbRecord);
        if (dbValidationError) {
          errors.push(`Record ${dbRecord.id}: ${dbValidationError}`);
          continue;
        }

        processedRecords.push(dbRecord);
      } catch (error) {
        this.logger.error('Error processing CSV record:', error);
        errors.push(`Record ${record.id || 'unknown'}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (errors.length > 0) {
      await this.notificationService.notifyError(
        new Error(`CSV processing completed with ${errors.length} errors:\n${errors.join('\n')}`),
        'CSV Processing',
      );
    }

    return processedRecords;
  }
} 