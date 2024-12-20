export const categories = {
  food: 'Food & Dining',
  transport: 'Transportation',
  shopping: 'Shopping',
  utilities: 'Utilities',
  entertainment: 'Entertainment',
  health: 'Healthcare',
  travel: 'Travel',
  business: 'Business',
  other: 'Other'
} as const;

export type Category = keyof typeof categories;

export const categoryColors: Record<Category, string> = {
  [categories.food]: 'blue',
  [categories.transport]: 'purple',
  [categories.shopping]: 'pink',
  [categories.utilities]: 'orange',
  [categories.entertainment]: 'indigo',
  [categories.health]: 'red',
  [categories.travel]: 'gray',
  [categories.business]: 'cyan',
  [categories.other]: 'gray'
} as const;

export const categoryIcons: Record<Category, string> = {
  [categories.food]: '🍽️',
  [categories.transport]: '🚌',
  [categories.shopping]: '🛍️',
  [categories.utilities]: '🔧',
  [categories.entertainment]: '🎭',
  [categories.health]: '⚕️',
  [categories.travel]: '✈️',
  [categories.business]: '💼',
  [categories.other]: '❓'
} as const;

export const categoryDescriptions: Record<Category, string> = {
  [categories.food]: 'Restaurants, takeout, and food delivery',
  [categories.transport]: 'Parking fees and public transit',
  [categories.shopping]: 'Retail purchases and supplies',
  [categories.utilities]: 'Utilities and recurring services',
  [categories.entertainment]: 'Movies, events, and activities',
  [categories.health]: 'Healthcare and wellness expenses',
  [categories.travel]: 'Flights, hotels, and transportation',
  [categories.business]: 'Professional and business services',
  [categories.other]: 'Uncategorized expenses'
} as const;

export const categoryKeywords: Record<Category, string[]> = {
  [categories.food]: ['restaurant', 'food', 'dining', 'takeout', 'delivery', 'grubhub', 'doordash'],
  [categories.transport]: ['parking', 'garage', 'transit', 'metro', 'train'],
  [categories.shopping]: ['amazon', 'target', 'walmart', 'retail', 'store'],
  [categories.utilities]: ['utility', 'phone', 'internet', 'power', 'gas', 'water'],
  [categories.entertainment]: ['movie', 'theater', 'netflix', 'spotify', 'hulu'],
  [categories.health]: ['medical', 'doctor', 'pharmacy', 'health', 'dental'],
  [categories.travel]: ['airline', 'hotel', 'flight', 'airbnb', 'uber', 'lyft'],
  [categories.business]: ['consulting', 'service', 'professional', 'office'],
  [categories.other]: []
} as const;

export function getCategoryFromKeywords(description: string): Category {
  const normalizedDescription = description.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => normalizedDescription.includes(keyword))) {
      return category as Category;
    }
  }
  
  return categories.other;
}

export function getCategoryColor(category: Category): string {
  return categoryColors[category] || categoryColors[categories.other];
}

export function getCategoryIcon(category: Category): string {
  return categoryIcons[category] || categoryIcons[categories.other];
}

export function getCategoryDescription(category: Category): string {
  return categoryDescriptions[category] || categoryDescriptions[categories.other];
} 