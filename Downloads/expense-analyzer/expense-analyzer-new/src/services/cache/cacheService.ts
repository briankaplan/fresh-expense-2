'use client';

import LRU from 'lru-cache';
import { Logger } from '@/utils/logger';

interface CacheConfig {
  max?: number;
  ttl?: number;
  updateAgeOnGet?: boolean;
}

export class CacheService<T = any> {
  private cache: LRU<string, T>;
  private logger = Logger;

  constructor(config: CacheConfig = {}) {
    this.cache = new LRU({
      max: config.max || 500,
      ttl: config.ttl || 1000 * 60 * 5, // 5 minutes
      updateAgeOnGet: config.updateAgeOnGet ?? true
    });
  }

  async get(key: string): Promise<T | undefined> {
    const value = this.cache.get(key);
    this.logger.debug('Cache get', { key, hit: !!value });
    return value;
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    this.cache.set(key, value, { ttl });
    this.logger.debug('Cache set', { key });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    this.logger.debug('Cache delete', { key });
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.logger.debug('Cache cleared');
  }

  async getOrSet(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }
} 