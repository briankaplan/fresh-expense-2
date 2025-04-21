import { Injectable, Logger } from "@nestjs/common";

import type { RedisService } from "./redis.service";

interface CacheOptions {
  prefix?: string;
  ttl?: number;
}

/**
 * Service for handling Redis caching operations
 * Provides methods for getting, setting, and managing cached data with TTL and prefix support
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTTL = 3600; // 1 hour in seconds

  constructor(private readonly redisService: RedisService) {}

  private getPrefixedKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  /**
   * Retrieves a value from the cache
   * @param key - The cache key to retrieve
   * @param options - Optional cache options including prefix
   * @returns The cached value if found, null otherwise
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      const prefixedKey = this.getPrefixedKey(key, options?.prefix);
      const rawData = await this.redisService.get(prefixedKey);
      if (!rawData) {
        return null;
      }
      return JSON.parse(rawData) as T;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(`Cache get error: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Sets a value in the cache
   * @param key - The cache key to set
   * @param value - The value to cache
   * @param options - Optional cache options including TTL and prefix
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    try {
      const prefixedKey = this.getPrefixedKey(key, options?.prefix);
      const serializedValue = JSON.stringify(value);
      const ttl = options?.ttl || this.defaultTTL;

      await this.redisService.set(prefixedKey, serializedValue, { ttl });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(`Cache set error: ${errorMessage}`);
    }
  }

  /**
   * Deletes a value from the cache
   * @param key - The cache key to delete
   * @param prefix - Optional prefix for the key
   */
  async delete(key: string, prefix?: string): Promise<void> {
    try {
      const prefixedKey = this.getPrefixedKey(key, prefix);
      await this.redisService.delete(prefixedKey);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(`Cache delete error: ${errorMessage}`);
    }
  }

  /**
   * Clears all cache entries
   */
  async clear(): Promise<void> {
    try {
      await this.redisService.clearAll();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(`Cache clear error: ${errorMessage}`);
    }
  }

  /**
   * Clears all cache entries with a specific prefix
   * @param prefix - The prefix to clear
   */
  async clearByPrefix(prefix: string): Promise<void> {
    try {
      const pattern = this.getPrefixedKey(prefix, "*");
      const keys = await this.redisService.generateKey(pattern);
      if (keys) {
        await this.redisService.delete(keys);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(`Cache clearByPrefix error: ${errorMessage}`);
    }
  }

  /**
   * Retrieves a value from the cache or sets it if it doesn't exist
   * @param key - The cache key to retrieve or set
   * @param fn - The function to call if the value doesn't exist in the cache
   * @param options - Optional cache options including TTL and prefix
   * @returns The cached value
   */
  async getOrSet<T>(key: string, fn: () => Promise<T>, options?: CacheOptions): Promise<T> {
    const cached = await this.get(key, options);
    if (cached !== null) {
      return cached;
    }

    const value = await fn();
    await this.set(key, value, options);
    return value;
  }
}
