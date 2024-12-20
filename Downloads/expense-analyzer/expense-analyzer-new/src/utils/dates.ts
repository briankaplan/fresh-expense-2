import { format, parseISO } from 'date-fns';

export function formatDateDisplay(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

export function formatDateInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function parseDate(dateString: string): Date {
  return parseISO(dateString);
} 