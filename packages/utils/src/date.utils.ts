import { addDays, differenceInDays, format, isValid, parse, subDays, parseISO } from "date-fns";

/**
 * Format a date string
 * @param date The date to format
 * @param formatString The format string (default: 'MMM d, yyyy')
 * @returns The formatted date string
 */
export function formatDate(date: string | Date, formatString = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  // Create a UTC date at midnight
  const utcDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  // Adjust for local timezone offset to ensure consistent display
  const offset = utcDate.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(utcDate.getTime() + offset);
  return format(adjustedDate, formatString);
}

/**
 * Parse a date string into a Date object
 * @param dateString The date string to parse
 * @param formatString The format string (default: 'yyyy-MM-dd')
 * @returns The parsed Date object or null if invalid
 */
export function parseDate(dateString: string, formatString = "yyyy-MM-dd"): Date {
  const parsedDate = parse(dateString, formatString, new Date());
  if (!isValid(parsedDate)) {
    throw new Error("Invalid date string");
  }
  return parsedDate;
}

/**
 * Check if a date string is valid
 * @param dateString The date string to check
 * @param formatString The format string (default: 'yyyy-MM-dd')
 * @returns True if the date string is valid, false otherwise
 */
export function isValidDate(dateString: string, formatString = "yyyy-MM-dd"): boolean {
  try {
    parseDate(dateString, formatString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Add days to a date
 * @param date The date to add days to
 * @param days The number of days to add
 * @returns The new date
 */
export function addDaysToDate(date: Date | string | number, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Subtract days from a date
 * @param date The date to subtract days from
 * @param days The number of days to subtract
 * @returns The new date
 */
export function subtractDaysFromDate(date: Date | string | number, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

/**
 * Calculate the number of days between two dates
 * @param startDate The start date
 * @param endDate The end date
 * @returns The number of days between the dates
 */
export function daysBetweenDates(
  startDate: Date | string | number,
  endDate: Date | string | number,
): number {
  const parsedStartDate =
    typeof startDate === "string"
      ? parse(startDate, "yyyy-MM-dd", new Date())
      : new Date(startDate);
  const parsedEndDate =
    typeof endDate === "string" ? parse(endDate, "yyyy-MM-dd", new Date()) : new Date(endDate);
  return differenceInDays(parsedEndDate, parsedStartDate);
}

/**
 * Check if a date is within a date range
 * @param date The date to check
 * @param startDate The start date of the range
 * @param endDate The end date of the range
 * @returns True if the date is within the range, false otherwise
 */
export function isDateInRange(
  date: Date | string | number,
  startDate: Date | string | number,
  endDate: Date | string | number,
): boolean {
  const parsedDate =
    typeof date === "string" ? parse(date, "yyyy-MM-dd", new Date()) : new Date(date);
  const parsedStartDate =
    typeof startDate === "string"
      ? parse(startDate, "yyyy-MM-dd", new Date())
      : new Date(startDate);
  const parsedEndDate =
    typeof endDate === "string" ? parse(endDate, "yyyy-MM-dd", new Date()) : new Date(endDate);

  return parsedDate >= parsedStartDate && parsedDate <= parsedEndDate;
}

/**
 * Get the current date in ISO format
 * @returns The current date in ISO format
 */
export function getCurrentISODate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get the start of the month for a given date
 * @param date The date to get the start of month for
 * @returns The start of the month
 */
export function getStartOfMonth(date: Date | string | number): Date {
  const parsedDate =
    typeof date === "string" ? parse(date, "yyyy-MM-dd", new Date()) : new Date(date);
  return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
}

/**
 * Get the end of the month for a given date
 * @param date The date to get the end of month for
 * @returns The end of the month
 */
export function getEndOfMonth(date: Date | string | number): Date {
  const parsedDate =
    typeof date === "string" ? parse(date, "yyyy-MM-dd", new Date()) : new Date(date);
  return new Date(parsedDate.getFullYear(), parsedDate.getMonth() + 1, 0);
}

export { addDays, subDays, differenceInDays };
