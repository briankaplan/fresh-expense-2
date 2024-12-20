'use client';

import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface SearchFilters {
  query: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  hasReceipt?: boolean;
  category?: string;
}

interface TransactionSearchProps {
  onSearch: (filters: {
    query: string;
    dateFrom?: string;
    dateTo?: string;
    amountMin?: number;
    amountMax?: number;
    hasReceipt?: boolean;
    category?: string;
  }) => void;
  categories?: string[];
}

export const TransactionSearch: React.FC<TransactionSearchProps> = ({ 
  onSearch,
  categories = []
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    hasReceipt: undefined,
    category: undefined
  });

  const handleFilterChange = (key: keyof SearchFilters, value: string | boolean | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch({
      ...newFilters,
      amountMin: newFilters.amountMin ? parseFloat(newFilters.amountMin) : undefined,
      amountMax: newFilters.amountMax ? parseFloat(newFilters.amountMax) : undefined,
    });
  };

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      query: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
      hasReceipt: undefined,
      category: undefined
    };
    setFilters(defaultFilters);
    onSearch(defaultFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== undefined
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          <Filter className="h-5 w-5" />
          {showAdvanced ? 'Less filters' : 'More filters'}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700"
          >
            <X className="h-5 w-5" />
            Clear filters
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <input
              type="date"
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date To
            </label>
            <input
              type="date"
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                className="w-full pl-7 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={filters.amountMin}
                onChange={(e) => handleFilterChange('amountMin', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                className="w-full pl-7 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={filters.amountMax}
                onChange={(e) => handleFilterChange('amountMax', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Receipt Status
            </label>
            <select
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={filters.hasReceipt === undefined ? '' : filters.hasReceipt.toString()}
              onChange={(e) => handleFilterChange('hasReceipt', e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <option value="">All Transactions</option>
              <option value="true">Has Receipt</option>
              <option value="false">Missing Receipt</option>
            </select>
          </div>
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 