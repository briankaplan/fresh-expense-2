import { Injectable } from '@nestjs/common';
import { TokenBucketRateLimiter } from '../../services/rateLimiter';

export interface RateLimitConfig {
  tokensPerInterval: number;
  intervalMs: number;
  maxBurst?: number;
}

@Injectable()
export class RateLimiterService {
  private readonly limiters = new Map<string, TokenBucketRateLimiter>();

  // Default configurations for different services
  private readonly defaultConfigs = {
    GMAIL: {
      SEARCH: { tokensPerInterval: 100, intervalMs: 60 * 1000 },
      GET: { tokensPerInterval: 600, intervalMs: 60 * 1000 },
    },
    PHOTOS: {
      SEARCH: { tokensPerInterval: 100, intervalMs: 60 * 1000 },
      GET: { tokensPerInterval: 600, intervalMs: 60 * 1000 },
      DOWNLOAD: { tokensPerInterval: 300, intervalMs: 60 * 1000 },
    },
    AI: {
      HUGGINGFACE: {
        INFERENCE: { tokensPerInterval: 30, intervalMs: 60 * 1000 },
        INFERENCE_LARGE: { tokensPerInterval: 8, intervalMs: 60 * 1000 },
        DAILY: { tokensPerInterval: 1000, intervalMs: 24 * 60 * 60 * 1000, maxBurst: 1000 },
      },
      BERT: { tokensPerInterval: 50, intervalMs: 60 * 1000 },
    },
    RECEIPT_PROCESSOR: {
      PROCESS: { tokensPerInterval: 50, intervalMs: 60 * 1000 },
    },
  };

  constructor() {
    // Initialize all default limiters
    this.initializeDefaultLimiters();
  }

  private initializeDefaultLimiters() {
    for (const [service, configs] of Object.entries(this.defaultConfigs)) {
      for (const [operation, config] of Object.entries(configs)) {
        const key = `${service}.${operation}`;
        this.limiters.set(
          key,
          new TokenBucketRateLimiter(config.tokensPerInterval, config.intervalMs, config.maxBurst)
        );
      }
    }
  }

  getLimiter(key: string, config?: RateLimitConfig): TokenBucketRateLimiter {
    let limiter = this.limiters.get(key);

    if (!limiter) {
      if (!config) {
        throw new Error(`No rate limiter found for key ${key} and no config provided`);
      }

      limiter = new TokenBucketRateLimiter(
        config.tokensPerInterval,
        config.intervalMs,
        config.maxBurst
      );
      this.limiters.set(key, limiter);
    }

    return limiter;
  }

  async waitForToken(key: string): Promise<void> {
    const limiter = this.getLimiter(key);
    await limiter.waitForToken();
  }

  async withRateLimit<T>(key: string, fn: () => Promise<T>): Promise<T> {
    await this.waitForToken(key);
    return fn();
  }
}
