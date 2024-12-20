'use client';

import { categories } from '@/config/categories';
import { Logger } from '@/utils/logger';
import { CacheService } from '@/services/cache/cacheService';

interface MerchantMapping {
  name: string;
  category: string;
  location?: string;
  parent?: string;
  aliases: string[];
  isBusinessVendor: boolean;
}

export class MerchantMappingService {
  private cache: CacheService<MerchantMapping>;
  private readonly SIMILARITY_THRESHOLD = 0.85;

  constructor() {
    this.cache = new CacheService<MerchantMapping>({
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      max: 1000
    });
  }

  async findMerchant(name: string): Promise<MerchantMapping | null> {
    const normalized = this.normalizeMerchantName(name);
    
    // Check cache first
    const cached = await this.cache.get(normalized);
    if (cached) return cached;

    // Find best match from database
    const mapping = await this.findBestMatch(normalized);
    if (mapping) {
      await this.cache.set(normalized, mapping);
    }

    return mapping;
  }

  async findBestMatch(name: string): Promise<MerchantMapping | null> {
    const merchants = await this.getAllMerchants();
    let bestMatch: MerchantMapping | null = null;
    let bestScore = 0;

    for (const merchant of merchants) {
      const score = this.calculateSimilarity(name, merchant.name);
      if (score > this.SIMILARITY_THRESHOLD && score > bestScore) {
        bestMatch = merchant;
        bestScore = score;
      }

      // Check aliases
      for (const alias of merchant.aliases) {
        const aliasScore = this.calculateSimilarity(name, alias);
        if (aliasScore > this.SIMILARITY_THRESHOLD && aliasScore > bestScore) {
          bestMatch = merchant;
          bestScore = aliasScore;
        }
      }
    }

    return bestMatch;
  }

  private calculateSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    return (longer.length - this.editDistance(longer, shorter)) / longer.length;
  }

  private editDistance(s1: string, s2: string): number {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(
              Math.min(newValue, lastValue),
              costs[j]
            ) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  private normalizeMerchantName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async getAllMerchants(): Promise<MerchantMapping[]> {
    // TODO: Implement actual database fetch
    return [
      {
        name: "Starbucks",
        category: "food",
        aliases: ["sbux", "starbuck"],
        isBusinessVendor: false
      },
      {
        name: "Amazon",
        category: "shopping",
        aliases: ["amzn", "amazon.com"],
        isBusinessVendor: true
      }
      // ... more merchants
    ];
  }
}

export const merchantMappingService = new MerchantMappingService(); 