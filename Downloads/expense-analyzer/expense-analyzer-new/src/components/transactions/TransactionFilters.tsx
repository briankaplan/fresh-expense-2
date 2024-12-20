'use client';

import React, { useState } from 'react';
import { Search, Calendar, Filter } from 'lucide-react';

interface TransactionFilters {
  search: string;
  dateFrom: string;
  dateTo: string;
  category: string;
  type: 'all' | 'personal' | 'business';
  hasReceipt: 'all' | 'yes' | 'no';
}

interface TransactionFiltersProps {
  onFilterChange: (filters: Partial<TransactionFilters>) => void;
  initialFilters?: Partial<TransactionFilters>;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  onFilterChange,
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    dateFrom: '',
    dateTo: '',
    category: '',
    type: 'all',
    hasReceipt: 'all',
    ...initialFilters
  });

  const handleChange = (name: keyof TransactionFilters, value: string) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search transactions..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleChange('dateFrom', e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleChange('dateTo', e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Category and Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="meals">Meals & Entertainment</option>
            <option value="travel">Travel</option>
            <option value="office">Office Supplies</option>
            <option value="software">Software & Services</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value as TransactionFilters['type'])}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="personal">Personal</option>
            <option value="business">Business</option>
          </select>
        </div>
      </div>

      {/* Receipt Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Status</label>
        <select
          value={filters.hasReceipt}
          onChange={(e) => handleChange('hasReceipt', e.target.value as TransactionFilters['hasReceipt'])}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All Transactions</option>
          <option value="yes">Has Receipt</option>
          <option value="no">Missing Receipt</option>
        </select>
      </div>
    </div>
  );
}; 