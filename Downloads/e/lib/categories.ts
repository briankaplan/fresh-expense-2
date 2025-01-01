interface Category {
  name: string
  keywords: string[]
  patterns: RegExp[]
}

const categories: Category[] = [
  {
    name: 'Groceries',
    keywords: ['supermarket', 'grocery', 'food', 'market'],
    patterns: [/mart$/, /market$/i, /foods$/i]
  },
  {
    name: 'Restaurant',
    keywords: ['restaurant', 'cafe', 'diner', 'bistro', 'bar', 'grill'],
    patterns: [/restaurant/i, /cafe/i, /kitchen/i]
  },
  {
    name: 'Travel',
    keywords: ['airline', 'hotel', 'motel', 'flight', 'car rental'],
    patterns: [/airlines?$/i, /hotels?$/i, /rentals?$/i]
  },
  {
    name: 'Office Supplies',
    keywords: ['office', 'supplies', 'stationary', 'printing'],
    patterns: [/office/i, /supplies$/i]
  },
  {
    name: 'Electronics',
    keywords: ['electronics', 'computer', 'phone', 'digital'],
    patterns: [/tech$/i, /electronics$/i]
  },
  {
    name: 'Entertainment',
    keywords: ['cinema', 'movie', 'theatre', 'concert', 'ticket'],
    patterns: [/cinema$/i, /theatre$/i, /entertainment$/i]
  }
]

export async function categorizeReceipt(
  merchant: string,
  items?: Array<{ description: string; amount: number }>
): Promise<string> {
  // Clean merchant name
  const cleanMerchant = merchant.toLowerCase().trim()

  // Check categories based on merchant name
  for (const category of categories) {
    // Check keywords
    if (category.keywords.some(keyword => cleanMerchant.includes(keyword))) {
      return category.name
    }

    // Check patterns
    if (category.patterns.some(pattern => pattern.test(cleanMerchant))) {
      return category.name
    }
  }

  // If no match found from merchant name, check items
  if (items?.length) {
    const itemDescriptions = items.map(item => item.description.toLowerCase())
    for (const category of categories) {
      if (itemDescriptions.some(desc => 
        category.keywords.some(keyword => desc.includes(keyword)) ||
        category.patterns.some(pattern => pattern.test(desc))
      )) {
        return category.name
      }
    }
  }

  return 'Other'
} 