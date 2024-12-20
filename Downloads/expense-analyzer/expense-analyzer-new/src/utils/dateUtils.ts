'use client';

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateDisplay = (date: string): string => {
  if (!date) return '';
  
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return date;
  }
};

export function isValidDate(date: string): boolean {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

export function compareDates(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getTime() - d2.getTime();
}

export function getDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function subtractDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return formatDate(d);
}

export function parseTransactionDate(dateStr: string): string {
  if (!dateStr) return '';

  try {
    // Handle various date formats
    const formats = [
      // MM/DD/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // YYYY-MM-DD
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
      // MM-DD-YYYY
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        const [_, part1, part2, part3] = match;
        // Convert to Date object and format consistently
        const date = format === formats[1] 
          ? new Date(`${part1}-${part2}-${part3}`)
          : new Date(`${part3}-${part1}-${part2}`);
        
        if (isValidDate(date.toISOString())) {
          return formatDate(date);
        }
      }
    }

    // Fallback to direct parsing
    const date = new Date(dateStr);
    if (isValidDate(date.toISOString())) {
      return formatDate(date);
    }

    return dateStr;
  } catch (error) {
    console.error('Error parsing date:', error);
    return dateStr;
  }
} 

export interface DateRange {
  startDate: string;
  endDate: string;
}

export const DATE_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last7Days',
  LAST_30_DAYS: 'last30Days',
  THIS_MONTH: 'thisMonth',
  LAST_MONTH: 'lastMonth',
  THIS_QUARTER: 'thisQuarter',
  LAST_QUARTER: 'lastQuarter',
  THIS_YEAR: 'thisYear',
  LAST_YEAR: 'lastYear',
  CUSTOM: 'custom'
} as const;

export type DateRangeType = typeof DATE_RANGES[keyof typeof DATE_RANGES];

export function getDateRange(rangeType: DateRangeType, customRange?: DateRange): DateRange {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  switch (rangeType) {
    case DATE_RANGES.TODAY:
      return {
        startDate: formatDate(startOfDay),
        endDate: formatDate(today)
      };
      
    case DATE_RANGES.YESTERDAY: {
      const yesterday = new Date(startOfDay);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        startDate: formatDate(yesterday),
        endDate: formatDate(yesterday)
      };
    }
    
    case DATE_RANGES.LAST_7_DAYS: {
      const last7Days = new Date(startOfDay);
      last7Days.setDate(last7Days.getDate() - 7);
      return {
        startDate: formatDate(last7Days),
        endDate: formatDate(today)
      };
    }
    
    case DATE_RANGES.LAST_30_DAYS: {
      const last30Days = new Date(startOfDay);
      last30Days.setDate(last30Days.getDate() - 30);
      return {
        startDate: formatDate(last30Days),
        endDate: formatDate(today)
      };
    }
    
    case DATE_RANGES.THIS_MONTH: {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        startDate: formatDate(startOfMonth),
        endDate: formatDate(today)
      };
    }
    
    case DATE_RANGES.LAST_MONTH: {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        startDate: formatDate(startOfLastMonth),
        endDate: formatDate(endOfLastMonth)
      };
    }
    
    case DATE_RANGES.THIS_QUARTER: {
      const quarter = Math.floor(today.getMonth() / 3);
      const startOfQuarter = new Date(today.getFullYear(), quarter * 3, 1);
      return {
        startDate: formatDate(startOfQuarter),
        endDate: formatDate(today)
      };
    }
    
    case DATE_RANGES.LAST_QUARTER: {
      const quarter = Math.floor(today.getMonth() / 3);
      const startOfLastQuarter = new Date(today.getFullYear(), (quarter - 1) * 3, 1);
      const endOfLastQuarter = new Date(today.getFullYear(), quarter * 3, 0);
      return {
        startDate: formatDate(startOfLastQuarter),
        endDate: formatDate(endOfLastQuarter)
      };
    }
    
    case DATE_RANGES.THIS_YEAR: {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return {
        startDate: formatDate(startOfYear),
        endDate: formatDate(today)
      };
    }
    
    case DATE_RANGES.LAST_YEAR: {
      const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
      const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
      return {
        startDate: formatDate(startOfLastYear),
        endDate: formatDate(endOfLastYear)
      };
    }
    
    case DATE_RANGES.CUSTOM:
      return customRange || {
        startDate: formatDate(startOfDay),
        endDate: formatDate(today)
      };
      
    default:
      return {
        startDate: formatDate(startOfDay),
        endDate: formatDate(today)
      };
  }
}

export function isDateInRange(date: string, range: DateRange): boolean {
  const checkDate = new Date(date);
  const startDate = new Date(range.startDate);
  const endDate = new Date(range.endDate);
  
  return checkDate >= startDate && checkDate <= endDate;
}

export function getQuarterFromDate(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1;
}

export function getQuarterDateRange(year: number, quarter: number): DateRange {
  const startMonth = (quarter - 1) * 3;
  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, startMonth + 3, 0);
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
}

export function getMonthDateRange(year: number, month: number): DateRange {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
} 