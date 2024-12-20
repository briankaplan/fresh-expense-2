'use client';

interface MerchantCategory {
  patterns: Array<string | RegExp>;
  category: 'personal' | 'business';
  subcategory?: string;
  confidence: number;
  requiresReceipt?: boolean;
  keywords?: string[];
  excludePatterns?: RegExp[];
  minAmount?: number;
  maxAmount?: number;
}

export const MERCHANT_CATEGORIES: MerchantCategory[] = [
  // AI & Development Tools
  {
    patterns: [/ANTHROPIC/i, /CLAUDE\.AI/i, /OPENAI/i, /ADA\s*AI/i, /SUNO/i, /MIDJOURNEY/i],
    category: 'business',
    subcategory: 'ai_tools',
    confidence: 0.95,
    requiresReceipt: true
  },

  // Business Services & Subscriptions
  {
    patterns: [/CLOUDFLARE/i, /EXPENSIFY/i, /ROSTR/i, /CHARTMETRIC/i],
    category: 'business',
    subcategory: 'business_services',
    confidence: 0.95,
    requiresReceipt: true
  },
  {
    patterns: [/NOTION/i, /CALENDARBRIDGE/i, /IMDBPRO/i, /CLEAR\*CLEARME/i],
    category: 'business',
    subcategory: 'productivity',
    confidence: 0.9,
    requiresReceipt: true
  },

  // Music & Entertainment (Business)
  {
    patterns: [/SPOTIFY/i, /APPLE\s*MUSIC/i, /TIDAL/i, /PANDORA/i],
    category: 'business',
    subcategory: 'music_streaming',
    confidence: 0.9,
    requiresReceipt: true,
    excludePatterns: [/SPOTIFY\s*PREMIUM/i]
  },

  // Personal Entertainment
  {
    patterns: [
      /NETFLIX/i, /HULU/i, /DISNEY\+/i, /HBO\s*MAX/i,
      /PARAMOUNT\+/i, /PEACOCK/i, /APPLE\s*TV/i
    ],
    category: 'personal',
    subcategory: 'entertainment',
    confidence: 0.9,
    requiresReceipt: false
  },

  // Transportation & Travel (Business)
  {
    patterns: [
      /METROPOLIS/i, /PMC/i, /PARK\s*HAPPY/i, /PARKING/i,
      /SOUTHWEST/i, /DELTA/i, /UNITED/i, /AMERICAN\s*AIRLINES/i,
      /UBER/i, /LYFT/i
    ],
    category: 'business',
    subcategory: 'travel',
    confidence: 0.9,
    requiresReceipt: true,
    excludePatterns: [/UBER\s*EATS/i]
  },

  // Business Dining & Food Delivery
  {
    patterns: [
      /SOHO\s*HOUSE/i, /CHAR\s*GREEN\s*HILLS/i, /AUDREY/i,
      /OPTIMIST/i, /O-KU/i, /CORNER\s*PUB/i,
      /DOORDASH/i, /UBER\s*EATS/i, /GRUBHUB/i
    ],
    category: 'business',
    subcategory: 'business_dining',
    confidence: 0.85,
    requiresReceipt: true,
    minAmount: 20
  },

  // Healthcare (Personal)
  {
    patterns: [
      /DENTIST/i, /DENTAL/i, /MEDICAL/i, /PHARMACY/i,
      /CVS/i, /WALGREENS/i, /OPTOMETRIST/i, /DOCTOR/i
    ],
    category: 'personal',
    subcategory: 'healthcare',
    confidence: 0.95,
    requiresReceipt: true
  }
];

export const getDefaultCategory = (amount: number, description?: string): MerchantCategory => {
  // Business meals detection
  if (description?.toLowerCase().includes('meeting') || description?.toLowerCase().includes('client')) {
    return {
      patterns: [],
      category: 'business',
      subcategory: 'business_meals',
      confidence: 0.7,
      requiresReceipt: true
    };
  }

  // Default based on amount
  return {
    patterns: [],
    category: amount >= 100 ? 'business' : 'personal',
    confidence: 0.6,
    requiresReceipt: amount >= 75,
    subcategory: 'uncategorized'
  };
};

export const isBusinessExpense = (merchant: string, description?: string): boolean => {
  // Check merchant patterns
  const matchesPattern = MERCHANT_CATEGORIES
    .filter(cat => cat.category === 'business')
    .some(cat => 
      cat.patterns.some(pattern => 
        typeof pattern === 'string' 
          ? merchant.toLowerCase().includes(pattern.toLowerCase())
          : pattern.test(merchant)
      )
    );

  if (matchesPattern) return true;

  // Check business keywords in description
  const businessKeywords = ['meeting', 'client', 'business', 'conference'];
  return !!description && businessKeywords.some(keyword => 
    description.toLowerCase().includes(keyword)
  );
};

export const isPersonalExpense = (merchant: string): boolean => {
  return MERCHANT_CATEGORIES
    .filter(cat => cat.category === 'personal')
    .some(cat => 
      cat.patterns.some(pattern => 
        typeof pattern === 'string' 
          ? merchant.toLowerCase().includes(pattern.toLowerCase())
          : pattern.test(merchant)
      )
    );
}; 