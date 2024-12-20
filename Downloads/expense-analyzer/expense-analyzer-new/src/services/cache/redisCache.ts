'use client';

import Redis from 'ioredis';
import { Logger } from '@/utils/logger';

export class RedisCache<T = any> {
  private redis: Redis;
  private prefix: string;

  constructor(options: {
    prefix?: string;
    url?: string;
    ttl?: number;
  } = {}) {
    this.prefix = options.prefix || 'cache:';
    this.redis = new Redis(options.url || process.env.REDIS_URL!, {
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3
    });

    this.redis.on('error', (error) => {
      Logger.error('Redis connection error', { error });
    });
  }

  async get(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(this.getKey(key));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      Logger.error('Redis get error', { error, key });
      return null;
    }
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(this.getKey(key), ttl, serialized);
      } else {
        await this.redis.set(this.getKey(key), serialized);
      }
    } catch (error) {
      Logger.error('Redis set error', { error, key });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(this.getKey(key));
    } catch (error) {
      Logger.error('Redis delete error', { error, key });
    }
  }

  async clear(pattern?: string): Promise<void> {
    try {
      const keys = await this.redis.keys(this.getKey(pattern || '*'));
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      Logger.error('Redis clear error', { error, pattern });
    }
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }
} 