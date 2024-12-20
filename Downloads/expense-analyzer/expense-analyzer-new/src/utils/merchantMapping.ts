'use client';

import { categories } from '@/config/categories';
import { Logger } from '@/utils/logger';
import { CacheService } from '@/services/cache/cacheService';

interface MerchantMapping {
  name: string;
  category: string;
  location?: string;
  parent?: string;
  displayName?: (description: string) => string;
  patterns?: RegExp[];
  keywords?: string[];
  excludePatterns?: RegExp[];
  confidence?: number;
}

interface NormalizedMerchant {
  name: string;
  category: string;
  location?: string;
  parent?: string;
  confidence: number;
  originalDescription: string;
}

class MerchantMappingService {
  private cache: CacheService<NormalizedMerchant>;
  private readonly MERCHANT_MAPPINGS: Record<string, MerchantMapping> = {
    // Payment Processors with dynamic merchant names
    'SQ *': {
      name: 'Square',
      displayName: (desc) => `${desc.split('SQ *')[1]?.trim()} (Square)`,
      category: categories.DINING,
      patterns: [/^SQ \*(.+)$/i],
      confidence: 0.9
    },
    'STRIPE *': {
      name: 'Stripe',
      displayName: (desc) => `${desc.split('STRIPE *')[1]?.trim()} (Stripe)`,
      category: categories.BUSINESS,
      patterns: [/^STRIPE \*(.+)$/i],
      confidence: 0.9
    },

    // Delivery Services
    'DD *DOORDASH': {
      name: 'DoorDash',
      displayName: (desc) => `DoorDash / ${desc.split('DOORDASH')[1]?.trim() || ''}`,
      category: categories.DINING,
      patterns: [/^DD \*DOORDASH/i, /DOORDASH\*/i],
      keywords: ['doordash', 'door dash'],
      confidence: 0.95
    },
    'UBER EATS': {
      name: 'Uber Eats',
      category: categories.DINING,
      patterns: [/^UBER\*EATS/i, /UBEREATS/i],
      keywords: ['uber eats'],
      confidence: 0.95
    },

    // Tech Services & Subscriptions
    'ANTHROPIC': {
      name: 'Anthropic AI',
      category: categories.SOFTWARE,
      parent: 'Anthropic',
      patterns: [/^ANTHROPIC/i, /^CLAUDE\.AI/i],
      keywords: ['anthropic', 'claude'],
      confidence: 1
    },
    'APPLE SERVICES': {
      name: 'Apple Services',
      category: categories.SOFTWARE,
      parent: 'Apple',
      patterns: [
        /^APPLE\.COM\/BILL/i,
        /^APL\*/i,
        /ITUNES\.COM\/BILL/i
      ],
      keywords: ['apple', 'itunes'],
      confidence: 1
    },

    // Travel & Transportation
    'UBER': {
      name: 'Uber',
      category: categories.TRAVEL,
      patterns: [/^UBER(?!\*EATS)/i],
      excludePatterns: [/UBER\*EATS/i],
      confidence: 0.9
    },
    'LYFT': {
      name: 'Lyft',
      category: categories.TRAVEL,
      patterns: [/^LYFT/i],
      confidence: 1
    },

    // Add more mappings...
  };

  constructor() {
    this.cache = new CacheService({ ttl: 1000 * 60 * 60 }); // 1 hour cache
  }

  async normalizeMerchantName(description: string): Promise<NormalizedMerchant> {
    const cacheKey = `merchant:${description}`;
    
    return this.cache.getOrSet(cacheKey, async () => {
      try {
        // Clean up description
        const cleanDesc = this.cleanDescription(description);
        
        // Find best matching merchant
        const match = this.findBestMatch(cleanDesc);
        
        if (match) {
          return {
            name: match.mapping.displayName?.(cleanDesc) || match.mapping.name,
            category: match.mapping.category,
            location: match.mapping.location,
            parent: match.mapping.parent,
            confidence: match.confidence,
            originalDescription: description
          };
        }

        // No match found - use cleaned description
        return {
          name: this.cleanDescription(description),
          category: categories.UNCATEGORIZED,
          confidence: 0.5,
          originalDescription: description
        };
      } catch (error) {
        Logger.error('Error normalizing merchant name', { error, description });
        return {
          name: description,
          category: categories.UNCATEGORIZED,
          confidence: 0,
          originalDescription: description
        };
      }
    });
  }

  private cleanDescription(description: string): string {
    return description
      .replace(/&amp;/g, '&')
      .replace(/[*#]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private findBestMatch(description: string): {
    mapping: MerchantMapping;
    confidence: number;
  } | null {
    let bestMatch: {
      mapping: MerchantMapping;
      confidence: number;
      patternMatch?: RegExpMatchArray;
    } | null = null;

    const upperDesc = description.toUpperCase();

    for (const [key, mapping] of Object.entries(this.MERCHANT_MAPPINGS)) {
      // Check exact match
      if (upperDesc === key) {
        return { mapping, confidence: 1 };
      }

      // Check patterns
      if (mapping.patterns) {
        for (const pattern of mapping.patterns) {
          const match = description.match(pattern);
          if (match && (!mapping.excludePatterns?.some(p => p.test(description)))) {
            const confidence = mapping.confidence || 0.8;
            if (!bestMatch || confidence > bestMatch.confidence) {
              bestMatch = { mapping, confidence, patternMatch: match };
            }
          }
        }
      }

      // Check keywords
      if (mapping.keywords) {
        const keywordMatches = mapping.keywords.filter(keyword => 
          upperDesc.includes(keyword.toUpperCase())
        );
        if (keywordMatches.length > 0) {
          const confidence = (mapping.confidence || 0.7) * 
            (keywordMatches.length / mapping.keywords.length);
          if (!bestMatch || confidence > bestMatch.confidence) {
            bestMatch = { mapping, confidence };
          }
        }
      }
    }

    return bestMatch;
  }

  async getMerchantCategory(merchantName: string): Promise<string> {
    const normalized = await this.normalizeMerchantName(merchantName);
    return normalized.category;
  }

  async getMerchantLocation(merchantName: string): Promise<string | undefined> {
    const normalized = await this.normalizeMerchantName(merchantName);
    return normalized.location;
  }

  async areMerchantsRelated(merchant1: string, merchant2: string): Promise<boolean> {
    const [norm1, norm2] = await Promise.all([
      this.normalizeMerchantName(merchant1),
      this.normalizeMerchantName(merchant2)
    ]);

    // Check exact matches
    if (norm1.name === norm2.name) return true;

    // Check parent companies
    if (norm1.parent && norm2.parent && norm1.parent === norm2.parent) return true;

    // Check if one is parent of other
    if (norm1.parent === norm2.name || norm2.parent === norm1.name) return true;

    // Check for high confidence matches with similar names
    if (norm1.confidence > 0.8 && norm2.confidence > 0.8) {
      const similarity = this.calculateStringSimilarity(norm1.name, norm2.name);
      return similarity > 0.8;
    }

    return false;
  }

  private calculateStringSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.calculateLevenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private calculateLevenshteinDistance(s1: string, s2: string): number {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs: number[] = [];
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
}

export const merchantMappingService = new MerchantMappingService(); 