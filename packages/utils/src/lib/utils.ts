// Define the ExpenseCategory type locally to avoid dependency issues
export type ExpenseCategory = 'FOOD' | 'TRANSPORT' | 'SHOPPING' | 'ENTERTAINMENT' | 'OTHER';

/**
 * Formats a number as currency
 * @param amount The amount to format
 * @param currency The currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Formats a date string to a human-readable format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  // Add timezone offset to handle UTC dates correctly
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculates the total amount for a list of expenses
 * @param expenses Array of expenses
 * @returns Total amount
 */
export function calculateTotal(expenses: { amount: number }[]): number {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

/**
 * Groups expenses by category
 * @param expenses Array of expenses
 * @returns Object with expenses grouped by category
 */
export function groupByCategory(
  expenses: { category: ExpenseCategory; amount: number }[]
): Record<ExpenseCategory, number> {
  return expenses.reduce(
    (groups, expense) => {
      const category = expense.category;
      groups[category] = (groups[category] || 0) + expense.amount;
      return groups;
    },
    {} as Record<ExpenseCategory, number>
  );
}

/**
 * Validates if a string is a valid ISO date
 * @param dateString The date string to validate
 * @returns boolean indicating if the date is valid
 */
export function isValidISODate(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    return (
      date instanceof Date &&
      !isNaN(date.getTime()) &&
      dateString.includes('T') && // Ensure it's a full ISO string
      dateString.includes('Z')
    ); // Ensure it's UTC
  } catch {
    return false;
  }
}
