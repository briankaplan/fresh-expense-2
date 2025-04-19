/**
 * Format a number as currency
 * @param amount The amount to format
 * @param currency The currency code (default: 'USD')
 * @param locale The locale (default: 'en-US')
 * @returns The formatted currency string
 */
export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Parse a currency string into a number
 * @param currencyString The currency string to parse
 * @param currency The currency code (default: 'USD')
 * @param locale The locale (default: 'en-US')
 * @returns The parsed number or NaN if invalid
 */
export function parseCurrency(currencyString: string, currency = 'USD', locale = 'en-US'): number {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  });
  const parts = formatter.formatToParts(0);
  const decimal = parts.find(part => part.type != null)?.value || '.';
  const group = parts.find(part => part.type != null)?.value || ',';
  const symbol = parts.find(part => part.type != null)?.value || '$';

  const cleanString = currencyString
    .replace(symbol, '')
    .replace(new RegExp(`[${group}]`, 'g'), '')
    .replace(decimal, '.')
    .trim();

  return parseFloat(cleanString);
}

/**
 * Convert an amount from one currency to another
 * @param amount The amount to convert
 * @param fromCurrency The source currency code
 * @param toCurrency The target currency code
 * @param exchangeRate The exchange rate to use
 * @returns The converted amount
 */
export function convertCurrency(
  amount: number,
  _fromCurrency: string,
  _toCurrency: string,
  exchangeRate: number,
): number {
  return amount * exchangeRate;
}

/**
 * Round a number to the specified number of decimal places
 * @param number The number to round
 * @param decimals The number of decimal places (default: 2)
 * @returns The rounded number
 */
export function roundToDecimal(number: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(number * factor) / factor;
}

/**
 * Calculate the percentage of a number
 * @param value The value to calculate the percentage of
 * @param total The total value
 * @param decimals The number of decimal places (default: 2)
 * @returns The percentage
 */
export function calculatePercentage(value: number, total: number, decimals = 2): number {
  if (total === 0) return 0;
  return roundToDecimal((value / total) * 100, decimals);
}

/**
 * Calculate the difference between two amounts as a percentage
 * @param oldAmount The old amount
 * @param newAmount The new amount
 * @param decimals The number of decimal places (default: 2)
 * @returns The percentage difference
 */
export function calculatePercentageDifference(
  oldAmount: number,
  newAmount: number,
  decimals = 2,
): number {
  if (oldAmount === 0) return 0;
  return roundToDecimal(((newAmount - oldAmount) / oldAmount) * 100, decimals);
}

/**
 * Check if a string is a valid currency amount
 * @param amount The amount to check
 * @param currency The currency code (default: 'USD')
 * @param locale The locale (default: 'en-US')
 * @returns True if the string is a valid currency amount, false otherwise
 */
export function isValidCurrency(amount: string, currency = 'USD', locale = 'en-US'): boolean {
  try {
    const parsed = parseCurrency(amount, currency, locale);
    return !isNaN(parsed);
  } catch {
    return false;
  }
}

/**
 * Get the currency symbol for a given currency code
 * @param currency The currency code
 * @param locale The locale (default: 'en-US')
 * @returns The currency symbol
 */
export function getCurrencySymbol(currency: string, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  })
    .format(0)
    .replace(/0/g, '')
    .trim();
}
