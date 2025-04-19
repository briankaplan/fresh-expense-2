import type { Analytics, Company, Transaction, User } from "@fresh-expense/types";
declare class ApiClient {
  private baseUrl;
  private token;
  constructor(baseUrl?: string);
  setToken(token: string | null): void;
  private request;
  login(
    email: string,
    password: string,
  ): Promise<{
    token: string;
    user: User;
  }>;
  register(userData: Partial<User>): Promise<{
    message: string;
  }>;
  logout(): Promise<void>;
  getTransactions(params: {
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
    category?: string;
  }): Promise<{
    data: Transaction[];
    total: number;
  }>;
  createTransaction(transaction: Partial<Transaction>): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction>;
  getCompanies(): Promise<Company[]>;
  createCompany(company: Partial<Company>): Promise<Company>;
  updateCompany(id: string, updates: Partial<Company>): Promise<Company>;
  getAnalytics(params: {
    startDate: Date;
    endDate: Date;
    period: Analytics["period"];
  }): Promise<Analytics>;
  uploadReceipt(file: File): Promise<{
    url: string;
  }>;
  processReceiptOCR(receiptUrl: string): Promise<{
    merchantName: string;
    date: string;
    total: number;
    items: Array<{
      description: string;
      amount: number;
    }>;
  }>;
  getReceiptsByTransaction(transactionId: string): Promise<
    Array<{
      url: string;
      processedData?: any;
    }>
  >;
  getSpendingByCategory(params: {
    startDate: Date;
    endDate: Date;
    groupBy: "day" | "week" | "month" | "year";
  }): Promise<
    Array<{
      category: string;
      amount: number;
      count: number;
      periodStart: string;
      periodEnd: string;
    }>
  >;
  getTrends(params: {
    months: number;
    categories?: string[];
  }): Promise<
    Array<{
      category: string;
      trend: "increasing" | "decreasing" | "stable";
      percentageChange: number;
      averageSpend: number;
    }>
  >;
  syncBankTransactions(): Promise<{
    message: string;
  }>;
}
export declare const apiClient: ApiClient;
//# sourceMappingURL=index.d.ts.map
