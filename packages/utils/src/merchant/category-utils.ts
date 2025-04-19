import { ExpenseCategory } from '@fresh-expense/types';

interface CategoryMetadata {
  name: string;
  icon: string;
  color: string;
  description: string;
}

const CATEGORY_METADATA: Record<ExpenseCategory, CategoryMetadata> = {
  [ExpenseCategory.FOOD]: {
    name: 'Food & Dining',
    icon: '🍽️',
    color: '#FF6B6B',
    description: 'Restaurants, cafes, and dining out',
  },
  [ExpenseCategory.GROCERIES]: {
    name: 'Groceries',
    icon: '🛒',
    color: '#4ECDC4',
    description: 'Grocery stores and supermarkets',
  },
  [ExpenseCategory.TRANSPORTATION]: {
    name: 'Transportation',
    icon: '🚗',
    color: '#45B7D1',
    description: 'Public transit, ride-sharing, and fuel',
  },
  [ExpenseCategory.HOUSING]: {
    name: 'Housing',
    icon: '🏠',
    color: '#96CEB4',
    description: 'Rent, mortgage, and home maintenance',
  },
  [ExpenseCategory.UTILITIES]: {
    name: 'Utilities',
    icon: '💡',
    color: '#FFAD60',
    description: 'Electricity, water, gas, and internet',
  },
  [ExpenseCategory.ENTERTAINMENT]: {
    name: 'Entertainment',
    icon: '🎬',
    color: '#FF9999',
    description: 'Movies, games, and streaming services',
  },
  [ExpenseCategory.SHOPPING]: {
    name: 'Shopping',
    icon: '🛍️',
    color: '#FFB5E8',
    description: 'Retail purchases and online shopping',
  },
  [ExpenseCategory.HEALTH]: {
    name: 'Health',
    icon: '🏥',
    color: '#7FB3D5',
    description: 'Medical expenses and healthcare',
  },
  [ExpenseCategory.OTHER]: {
    name: 'Other',
    icon: '📝',
    color: '#95A5A6',
    description: 'Miscellaneous expenses',
  },
};

/**
 * Get the display name for a category
 */
export function getCategoryDisplayName(category: ExpenseCategory): string {
  return CATEGORY_METADATA[category].name;
}

/**
 * Get the icon for a category
 */
export function getCategoryIcon(category: ExpenseCategory): string {
  return CATEGORY_METADATA[category].icon;
}

/**
 * Get the color for a category
 */
export function getCategoryColor(category: ExpenseCategory): string {
  return CATEGORY_METADATA[category].color;
}

/**
 * Get the description for a category
 */
export function getCategoryDescription(category: ExpenseCategory): string {
  return CATEGORY_METADATA[category].description;
}

/**
 * Get all category metadata
 */
export function getAllCategories(): Array<{ type: ExpenseCategory } & CategoryMetadata> {
  return Object.entries(CATEGORY_METADATA).map(([type, metadata]) => ({
    type: type as ExpenseCategory,
    ...metadata,
  }));
}

/**
 * Suggest a category based on merchant name and description
 */
export function suggestCategory(merchantName: string, description?: string): ExpenseCategory {
  const text = `${merchantName} ${description || ''}`.toLowerCase();

  // Define keyword mappings
  const categoryKeywords: Record<ExpenseCategory, string[]> = {
    [ExpenseCategory.FOOD]: ['restaurant', 'cafe', 'food', 'dining', 'meal', 'takeout', 'delivery'],
    [ExpenseCategory.GROCERIES]: ['grocery', 'supermarket', 'market', 'food store'],
    [ExpenseCategory.TRANSPORTATION]: ['uber', 'lyft', 'taxi', 'transit', 'gas', 'parking', 'train', 'bus'],
    [ExpenseCategory.HOUSING]: ['rent', 'mortgage', 'home', 'apartment', 'housing', 'maintenance'],
    [ExpenseCategory.UTILITIES]: ['electric', 'water', 'gas', 'internet', 'phone', 'utility'],
    [ExpenseCategory.ENTERTAINMENT]: ['movie', 'game', 'entertainment', 'streaming', 'spotify', 'netflix'],
    [ExpenseCategory.SHOPPING]: ['store', 'shop', 'retail', 'amazon', 'walmart', 'target'],
    [ExpenseCategory.HEALTH]: ['medical', 'doctor', 'pharmacy', 'health', 'dental', 'hospital'],
    [ExpenseCategory.OTHER]: [],
  };

  // Find matching category based on keywords
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category as ExpenseCategory;
    }
  }

  return ExpenseCategory.OTHER;
}
