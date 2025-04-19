// Currency utilities
export {
  formatCurrency,
  parseCurrency,
  convertCurrency,
  roundToDecimal,
  calculatePercentage,
  calculatePercentageDifference,
  isValidCurrency,
  getCurrencySymbol,
} from './currency.utils';

// Date utilities
export {
  formatDate,
  parseDate,
  isValidDate,
  addDays,
  subDays,
  differenceInDays,
} from './date.utils';

// String utilities
export { truncateString } from './string.utils';

// ID utilities
export { generateId } from './id.utils';

// Debounce utilities
export { debounce } from './debounce.utils';

// Types
export type { PaginatedResponse, SortOptions } from '@fresh-expense/types';

export * from './storage/r2.service';

// Receipt utilities
export {
  calculateReceiptMatchScore,
  ReceiptMatchScore
} from './receipt/receipt-matching';

// Export utility functions
export * from './auth';
export * from './database';
export * from './email';
export * from './image';
export * from './receipt';
export * from './string';
export * from './transaction';
