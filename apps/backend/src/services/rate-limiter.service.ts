import { Injectable, Logger } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";

interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number; // in milliseconds
  backoffStrategy?: "linear" | "exponential";
  maxRetries?: number;
}

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly limits: Map<string, RateLimitConfig> = new Map();
  private readonly requestCounts: Map<string, number> = new Map();
  private readonly lastResetTimes: Map<string, number> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.initializeDefaultLimits();
  }

  private initializeDefaultLimits() {
    // Add default rate limits from config
    const defaultLimits =
      this.configService.get<Record<string, RateLimitConfig>>("RATE_LIMITS") || {};
    Object.entries(defaultLimits).forEach(([key, config]) => {
      this.setLimit(key, config);
    });
  }

  setLimit(key: string, config: RateLimitConfig) {
    this.limits.set(key, {
      maxRequests: config.maxRequests,
      timeWindow: config.timeWindow,
      backoffStrategy: config.backoffStrategy || "linear",
      maxRetries: config.maxRetries || 3,
    });
  }

  private getLimit(key: string): RateLimitConfig {
    const limit = this.limits.get(key);
    if (!limit) {
      throw new Error(`No rate limit configured for key: ${key}`);
    }
    return limit;
  }

  private resetIfNeeded(key: string) {
    const now = Date.now();
    const lastReset = this.lastResetTimes.get(key) || 0;
    const limit = this.getLimit(key);

    if (now - lastReset >= limit.timeWindow) {
      this.requestCounts.set(key, 0);
      this.lastResetTimes.set(key, now);
    }
  }

  private calculateBackoff(attempt: number, strategy: "linear" | "exponential"): number {
    switch (strategy) {
      case "linear":
        return 1000 * attempt; // 1s, 2s, 3s, etc.
      case "exponential":
        return 1000 * 2 ** (attempt - 1); // 1s, 2s, 4s, 8s, etc.
      default:
        return 1000 * attempt;
    }
  }

  async withRateLimit<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const limit = this.getLimit(key);
    let attempt = 0;

    while (attempt < (limit.maxRetries || 3)) {
      this.resetIfNeeded(key);
      const currentCount = this.requestCounts.get(key) || 0;

      if (currentCount < limit.maxRequests) {
        this.requestCounts.set(key, currentCount + 1);
        try {
          return await fn();
        } catch (error) {
          const typedError = error instanceof Error ? error : new Error(String(error));
          this.logger.warn(`Rate limited operation failed: ${typedError.message}`);
          throw typedError;
        }
      }

      attempt++;
      const backoff = this.calculateBackoff(attempt, limit.backoffStrategy || "linear");
      this.logger.warn(`Rate limit exceeded for ${key}, attempt ${attempt}, waiting ${backoff}ms`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }

    throw new Error(`Rate limit exceeded for ${key} after ${limit.maxRetries} attempts`);
  }
}
