import useSWR from 'swr';
import { TransactionFilterInput, PaginationInput } from '@/lib/api/schemas';

interface UseTransactionsOptions {
  filters?: TransactionFilterInput;
  pagination?: PaginationInput;
}

export function useTransactions({ filters = {}, pagination = {} }: UseTransactionsOptions = {}) {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });
  
  // Add pagination to query params
  Object.entries(pagination).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  const { data, error, mutate } = useSWR(
    `/api/transactions?${queryParams.toString()}`
  );

  return {
    data,
    isLoading: !error && !data,
    error,
    mutate
  };
} 