import { ExpenseCategory } from "@fresh-expense/types";

/**
 * Formats a number as currency
 * @param amount The amount to format
 * @param currency The currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
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
  return localDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Calculates the total amount for a list of expenses
 * @param expenses Array of expenses with amounts
 * @returns Total amount
 */
export function calculateTotal(expenses: { amount: number }[]): number {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

/**
 * Groups expenses by category and returns total amount per category
 * @param expenses Array of expenses with category and amount
 * @returns Object with expenses grouped by category name with total amounts
 */
export function groupByCategory(
  expenses: { category: ExpenseCategory; amount: number }[],
): Record<ExpenseCategory, number> {
  return expenses.reduce(
    (groups, expense) => {
      groups[expense.category] = (groups[expense.category] || 0) + expense.amount;
      return groups;
    },
    {} as Record<ExpenseCategory, number>,
  );
}

/**
 * Groups expenses by category with full category information
 * @param expenses Array of expenses with category and amount
 * @param categories Array of available expense categories
 * @returns Object with expenses grouped by category ID with category details and total amounts
 */
export function groupByCategoryWithDetails(
  expenses: { categoryId: string; amount: number }[],
  categories: { id: string; name: string; icon: string }[],
): Record<string, { category: { id: string; name: string; icon: string }; total: number }> {
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

  return expenses.reduce(
    (groups, expense) => {
      const category = categoryMap.get(expense.categoryId);
      if (!category) return groups;

      if (!groups[expense.categoryId]) {
        groups[expense.categoryId] = {
          category,
          total: 0,
        };
      }
      groups[expense.categoryId].total += expense.amount;
      return groups;
    },
    {} as Record<string, { category: { id: string; name: string; icon: string }; total: number }>,
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
      dateString.includes("T") && // Ensure it's a full ISO string
      dateString.includes("Z")
    ); // Ensure it's UTC
  } catch {
    return false;
  }
}

/**
 * Validates if a category is a valid expense category
 * @param category The category to validate
 * @returns boolean indicating if the category is valid
 */
export function isValidExpenseCategory(category: string): category is ExpenseCategory {
  return Object.values(ExpenseCategory).includes(category as ExpenseCategory);
}
