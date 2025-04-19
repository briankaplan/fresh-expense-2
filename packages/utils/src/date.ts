import { ValidationError } from "./errors";

/**
 * Formats a date to YYYY-MM-DD format
 * @throws {ValidationError} If the date is invalid
 */
export function formatDateToISO(date: Date): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new ValidationError("Invalid date provided");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Parses a date string in YYYY-MM-DD format
 * @throws {ValidationError} If the date string is invalid
 */
export function parseISODate(dateString: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new ValidationError("Invalid date format. Expected YYYY-MM-DD");
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError("Invalid date string provided");
  }

  return date;
}

/**
 * Returns a Date object representing the start of the current month
 */
export function getStartOfCurrentMonth(): Date {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Returns a Date object representing the end of the current month
 */
export function getEndOfCurrentMonth(): Date {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Validates if a date is within a specified range
 * @throws {ValidationError} If any date is invalid
 */
export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new ValidationError("Invalid date provided");
  }
  if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) {
    throw new ValidationError("Invalid start date provided");
  }
  if (!(endDate instanceof Date) || Number.isNaN(endDate.getTime())) {
    throw new ValidationError("Invalid end date provided");
  }

  return date >= startDate && date <= endDate;
}

/**
 * Returns the number of days between two dates
 * @throws {ValidationError} If any date is invalid
 */
export function getDaysBetween(startDate: Date, endDate: Date): number {
  if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) {
    throw new ValidationError("Invalid start date provided");
  }
  if (!(endDate instanceof Date) || Number.isNaN(endDate.getTime())) {
    throw new ValidationError("Invalid end date provided");
  }

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Adds a specified number of days to a date
 * @throws {ValidationError} If the date is invalid
 */
export function addDays(date: Date, days: number): Date {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new ValidationError("Invalid date provided");
  }

  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Formats a date to a human-readable string
 * @throws {ValidationError} If the date is invalid
 */
export function formatDateHumanReadable(date: Date): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new ValidationError("Invalid date provided");
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

export function isToday(date: string | Date): boolean {
  const today = new Date();
  const d = new Date(date);
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}
