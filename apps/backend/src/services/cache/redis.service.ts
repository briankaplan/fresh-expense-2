import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs/redis';

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly defaultTTL = 3600; // 1 hour

  constructor(@InjectRedis() private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      const ttl = options.ttl || this.defaultTTL;

      if (options.tags?.length) {
        await this.redis.sadd(`tags:${options.tags.join(':')}`, key);
      }

      await this.redis.set(key, serializedValue, 'EX', ttl);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
    }
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    try {
      const tagKey = `tags:${tags.join(':')}`;
      const keys = await this.redis.smembers(tagKey);

      if (keys.length) {
        await this.redis.del(...keys, tagKey);
      }
    } catch (error) {
      this.logger.error(`Error invalidating cache by tags ${tags}:`, error);
    }
  }

  async clearAll(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (error) {
      this.logger.error('Error clearing cache:', error);
    }
  }

  generateKey(...parts: string[]): string {
    return parts.join(':');
  }

  // Receipt-specific cache methods
  async getReceiptCache(receiptId: string) {
    return this.get(`receipt:${receiptId}`);
  }

  async setReceiptCache(receiptId: string, data: any) {
    return this.set(`receipt:${receiptId}`, data, {
      tags: ['receipt', receiptId],
    });
  }

  async invalidateReceiptCache(receiptId: string) {
    return this.invalidateByTags(['receipt', receiptId]);
  }

  // Transaction-specific cache methods
  async getTransactionCache(transactionId: string) {
    return this.get(`transaction:${transactionId}`);
  }

  async setTransactionCache(transactionId: string, data: any) {
    return this.set(`transaction:${transactionId}`, data, {
      tags: ['transaction', transactionId],
    });
  }

  async invalidateTransactionCache(transactionId: string) {
    return this.invalidateByTags(['transaction', transactionId]);
  }

  // User-specific cache methods
  async getUserCache(userId: string) {
    return this.get(`user:${userId}`);
  }

  async setUserCache(userId: string, data: any) {
    return this.set(`user:${userId}`, data, {
      tags: ['user', userId],
    });
  }

  async invalidateUserCache(userId: string) {
    return this.invalidateByTags(['user', userId]);
  }

  // Search results cache methods
  async getSearchCache(query: string, filters: Record<string, any>) {
    const key = this.generateKey('search', query, JSON.stringify(filters));
    return this.get(key);
  }

  async setSearchCache(query: string, filters: Record<string, any>, results: any) {
    const key = this.generateKey('search', query, JSON.stringify(filters));
    return this.set(key, results, {
      ttl: 300, // 5 minutes for search results
      tags: ['search'],
    });
  }

  async invalidateSearchCache() {
    return this.invalidateByTags(['search']);
  }
}
