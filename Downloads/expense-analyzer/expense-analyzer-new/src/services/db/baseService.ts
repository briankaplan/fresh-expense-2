'use client';

import { db, withRetry } from '@/lib/db';
import { Logger } from '@/utils/logger';

export class BaseServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'BaseServiceError';
  }
}

export abstract class BaseService {
  protected db = db;
  protected logger = Logger;

  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: {
      errorCode: string;
      errorMessage: string;
      context?: Record<string, any>;
    }
  ): Promise<T> {
    try {
      return await withRetry(operation);
    } catch (error) {
      this.logger.error(options.errorMessage, {
        error,
        context: options.context
      });
      throw new BaseServiceError(
        options.errorMessage,
        options.errorCode,
        error
      );
    }
  }

  protected async executeTransaction<T>(
    operation: () => Promise<T>,
    options: {
      errorCode: string;
      errorMessage: string;
      context?: Record<string, any>;
    }
  ): Promise<T> {
    return this.executeWithRetry(
      async () => this.db.$transaction(operation),
      options
    );
  }
} 