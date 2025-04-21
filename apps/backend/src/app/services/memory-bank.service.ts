import * as fs from "node:fs/promises";
import * as path from "node:path";

import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";

interface MemoryItem<T> {
  data: T;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
    tags?: string[];
    source?: string;
    version?: string;
  };
}

interface MemoryOptions {
  /**
   * Time to live in milliseconds
   */
  ttl?: number;

  /**
   * Tags for categorizing the data
   */
  tags?: string[];

  /**
   * Source of the data
   */
  source?: string;

  /**
   * Version of the data
   */
  version?: string;

  /**
   * Whether to persist the data to disk
   */
  persist?: boolean;
}

@Injectable()
export class MemoryBankService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MemoryBankService.name);
  private readonly store = new Map<string, MemoryItem<any>>();
  private readonly persistPath: string;
  private persistInterval: ReturnType<typeof setInterval> | null = null;
  private readonly PERSIST_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.persistPath = path.join(process.cwd(), "data", "memory-bank", "store.json");
  }

  async onModuleInit() {
    await this.initialize();
  }

  onModuleDestroy() {
    if (this.persistInterval) {
      clearInterval(this.persistInterval);
    }
    return this.persistToDisk();
  }

  private async initialize() {
    try {
      // Create data directory if it doesn't exist
      const dir = path.dirname(this.persistPath);
      await fs.mkdir(dir, { recursive: true });

      // Load persisted data
      await this.loadFromDisk();

      // Start persistence interval
      this.persistInterval = setInterval(() => {
        this.persistToDisk().catch((err) =>
          this.logger.error("Failed to persist memory bank:", err),
        );
      }, this.PERSIST_INTERVAL);

      // Start cleanup interval
      setInterval(() => this.cleanup(), 60 * 1000); // Every minute

      this.logger.log("Memory bank initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize memory bank:", error);
      throw error;
    }
  }

  /**
   * Store data in memory
   */
  set<T>(key: string, data: T, options: MemoryOptions = {}): void {
    const now = new Date();
    const item: MemoryItem<T> = {
      data,
      metadata: {
        createdAt: now,
        updatedAt: now,
        expiresAt: options.ttl ? new Date(now.getTime() + options.ttl) : undefined,
        tags: options.tags,
        source: options.source,
        version: options.version,
      },
    };

    this.store.set(key, item);

    if (options.persist) {
      this.persistToDisk().catch((err) =>
        this.logger.error(`Failed to persist data for key ${key}:`, err),
      );
    }
  }

  /**
   * Retrieve data from memory
   */
  get<T>(key: string): T | null {
    const item = this.store.get(key) as MemoryItem<T>;

    if (!item) {
      return null;
    }

    // Check expiration
    if (item.metadata.expiresAt && item.metadata.expiresAt < new Date()) {
      this.store.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Update existing data
   */
  update<T>(key: string, data: Partial<T>): boolean {
    const item = this.store.get(key) as MemoryItem<T>;

    if (!item) {
      return false;
    }

    // Check expiration
    if (item.metadata.expiresAt && item.metadata.expiresAt < new Date()) {
      this.store.delete(key);
      return false;
    }

    // Update data and metadata
    item.data = { ...item.data, ...data };
    item.metadata.updatedAt = new Date();

    this.store.set(key, item);
    return true;
  }

  /**
   * Delete data from memory
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Find items by tags
   */
  findByTags(tags: string[]): Array<{ key: string; data: any }> {
    const results: Array<{ key: string; data: any }> = [];

    for (const [key, item] of this.store.entries()) {
      if (item.metadata.tags?.some((tag) => tags.includes(tag))) {
        results.push({ key, data: item.data });
      }
    }

    return results;
  }

  /**
   * Find items by source
   */
  findBySource(source: string): Array<{ key: string; data: any }> {
    const results: Array<{ key: string; data: any }> = [];

    for (const [key, item] of this.store.entries()) {
      if (item.metadata.source != null) {
        results.push({ key, data: item.data });
      }
    }

    return results;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.store.keys());
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get memory usage statistics
   */
  getStats(): {
    itemCount: number;
    bySource: Record<string, number>;
    byTag: Record<string, number>;
    expiringItems: number;
  } {
    const stats = {
      itemCount: this.store.size,
      bySource: {} as Record<string, number>,
      byTag: {} as Record<string, number>,
      expiringItems: 0,
    };

    for (const item of this.store.values()) {
      // Count by source
      if (item.metadata.source) {
        stats.bySource[item.metadata.source] = (stats.bySource[item.metadata.source] || 0) + 1;
      }

      // Count by tags
      item.metadata.tags?.forEach((tag) => {
        stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
      });

      // Count expiring items
      if (item.metadata.expiresAt) {
        stats.expiringItems++;
      }
    }

    return stats;
  }

  /**
   * Persist current state to disk
   */
  private async persistToDisk(): Promise<void> {
    try {
      const data = JSON.stringify(Array.from(this.store.entries()), null, 2);
      await fs.writeFile(this.persistPath, data, "utf8");
      this.logger.debug("Memory bank persisted to disk");
    } catch (error) {
      this.logger.error("Failed to persist memory bank to disk:", error);
      throw error;
    }
  }

  /**
   * Load persisted state from disk
   */
  private async loadFromDisk(): Promise<void> {
    try {
      const exists = await fs
        .access(this.persistPath)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        this.logger.debug("No persisted memory bank found");
        return;
      }

      const data = await fs.readFile(this.persistPath, "utf8");
      const entries = JSON.parse(data);

      // Restore dates
      for (const [key, item] of entries) {
        item.metadata.createdAt = new Date(item.metadata.createdAt);
        item.metadata.updatedAt = new Date(item.metadata.updatedAt);
        if (item.metadata.expiresAt) {
          item.metadata.expiresAt = new Date(item.metadata.expiresAt);
        }
        this.store.set(key, item);
      }

      this.logger.log(`Loaded ${entries.length} items from persisted memory bank`);
    } catch (error) {
      this.logger.error("Failed to load memory bank from disk:", error);
      throw error;
    }
  }

  /**
   * Clean up expired items
   */
  private cleanup(): void {
    const now = new Date();
    let cleaned = 0;

    for (const [key, item] of this.store.entries()) {
      if (item.metadata.expiresAt && item.metadata.expiresAt < now) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired items`);
    }
  }
}
