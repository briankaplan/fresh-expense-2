'use client';

import React from 'react';
import { format, isValid, parseISO } from 'date-fns';

interface DateBadgeProps {
  date: string | Date;
  variant?: 'default' | 'compact' | 'error';
  className?: string;
}

export const DateBadge: React.FC<DateBadgeProps> = ({ 
  date,
  variant = 'default',
  className = ''
}) => {
  const getDateDetails = () => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      
      if (!isValid(dateObj)) {
        return {
          isValid: false,
          day: null,
          month: null
        };
      }

      return {
        isValid: true,
        day: format(dateObj, 'd'),
        month: format(dateObj, 'MMM')
      };
    } catch {
      return {
        isValid: false,
        day: null,
        month: null
      };
    }
  };

  const { isValid: isValidDate, day, month } = getDateDetails();

  if (!date || !isValidDate) {
    return (
      <div 
        className={`
          flex-shrink-0 w-14 h-14 
          bg-red-50 border-red-200 border rounded-lg 
          overflow-hidden shadow-sm
          ${className}
        `}
      >
        <div className="h-full flex flex-col items-center justify-center">
          <span className="text-xs font-medium text-red-600 text-center px-1">
            Invalid
            <br />
            Date
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div 
        className={`
          inline-flex items-center gap-1 
          px-2 py-1 bg-gray-100 
          rounded text-sm text-gray-600
          ${className}
        `}
      >
        {day} {month}
      </div>
    );
  }

  return (
    <div 
      className={`
        flex-shrink-0 w-14 h-14 
        bg-white border rounded-lg 
        overflow-hidden shadow-sm
        hover:border-blue-200 hover:bg-blue-50
        transition-colors duration-200
        ${className}
      `}
    >
      <div className="h-full flex flex-col items-center justify-center">
        <span className="text-2xl font-bold leading-none text-gray-900">
          {day}
        </span>
        <span className="text-xs font-medium text-gray-500 uppercase">
          {month}
        </span>
      </div>
    </div>
  );
}; 