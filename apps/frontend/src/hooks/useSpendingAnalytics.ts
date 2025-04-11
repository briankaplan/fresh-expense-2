import { useState, useEffect } from 'react';

export interface SpendingData {
  category: string;
  amount: number;
  date: string;
  merchant: string;
  id: string;
}

export interface SpendingAnalytics {
  totalSpending: number;
  spendingByCategory: { [key: string]: number };
  spendingTrends: SpendingData[];
  topMerchants: { merchant: string; total: number }[];
}

export const useSpendingAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SpendingAnalytics>({
    totalSpending: 0,
    spendingByCategory: {},
    spendingTrends: [],
    topMerchants: []
  });

  const fetchAnalytics = async (startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/spending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startDate, endDate }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch spending analytics');
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    data,
    fetchAnalytics,
  };
}; 