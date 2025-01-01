import { Redis } from 'ioredis'
import { SubscriptionPattern, DuplicateGroup } from './types'

const redis = new Redis(process.env.REDIS_URL!)

interface CacheKeys {
  merchant: string
  patterns: string
  duplicates: string
  analytics: string
}

export class MatchingCache {
  private getKeys(merchantId: string): CacheKeys {
    return {
      merchant: `merchant:${merchantId}:data`,
      patterns: `merchant:${merchantId}:patterns`,
      duplicates: `merchant:${merchantId}:duplicates`,
      analytics: `merchant:${merchantId}:analytics`
    }
  }

  async cacheSubscriptionPatterns(merchantId: string, patterns: SubscriptionPattern[]) {
    const keys = this.getKeys(merchantId)
    await redis.setex(keys.patterns, 86400, JSON.stringify(patterns)) // 24h cache
  }

  async getCachedPatterns(merchantId: string): Promise<SubscriptionPattern[] | null> {
    const keys = this.getKeys(merchantId)
    const cached = await redis.get(keys.patterns)
    return cached ? JSON.parse(cached) : null
  }

  async invalidateCache(merchantId: string) {
    const keys = this.getKeys(merchantId)
    await redis.del([keys.merchant, keys.patterns, keys.duplicates, keys.analytics])
  }
} 