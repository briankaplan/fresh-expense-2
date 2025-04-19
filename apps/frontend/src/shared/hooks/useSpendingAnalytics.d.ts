export interface SpendingData {
  category: string;
  amount: number;
  date: string;
  merchant: string;
  id: string;
}
export interface SpendingAnalytics {
  totalSpending: number;
  spendingByCategory: {
    [key: string]: number;
  };
  spendingTrends: SpendingData[];
  topMerchants: {
    merchant: string;
    total: number;
  }[];
}
export declare const useSpendingAnalytics: () => {
  loading: boolean;
  error: string | null;
  data: SpendingAnalytics;
  fetchAnalytics: (startDate?: Date, endDate?: Date) => Promise<void>;
};
//# sourceMappingURL=useSpendingAnalytics.d.ts.map
