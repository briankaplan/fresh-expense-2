import { Transaction, User, Company, Analytics } from '@fresh-expense/types';
import { API_ENDPOINTS } from '@fresh-expense/constants';

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || 'An error occurred',
        response.status,
        data
      );
    }

    return data;
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return this.request(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: { email, password }
    });
  }

  async register(userData: Partial<User>): Promise<{ message: string }> {
    return this.request(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: userData
    });
  }

  async logout(): Promise<void> {
    return this.request(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST'
    });
  }

  // Transaction endpoints
  async getTransactions(params: {
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
    category?: string;
  }): Promise<{ data: Transaction[]; total: number }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return this.request(`${API_ENDPOINTS.TRANSACTIONS.BASE}?${queryParams}`);
  }

  async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    return this.request(API_ENDPOINTS.TRANSACTIONS.BASE, {
      method: 'POST',
      body: transaction
    });
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    return this.request(`${API_ENDPOINTS.TRANSACTIONS.BASE}/${id}`, {
      method: 'PUT',
      body: updates
    });
  }

  // Company endpoints
  async getCompanies(): Promise<Company[]> {
    return this.request('/api/companies');
  }

  async createCompany(company: Partial<Company>): Promise<Company> {
    return this.request('/api/companies', {
      method: 'POST',
      body: company
    });
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company> {
    return this.request(`/api/companies/${id}`, {
      method: 'PUT',
      body: updates
    });
  }

  // Analytics endpoints
  async getAnalytics(params: {
    startDate: Date;
    endDate: Date;
    period: Analytics['period'];
  }): Promise<Analytics> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
      period: params.period
    });

    return this.request(`${API_ENDPOINTS.ANALYTICS.BASE}?${queryParams}`);
  }

  // Receipt endpoints
  async uploadReceipt(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('receipt', file);

    return this.request(API_ENDPOINTS.RECEIPTS.UPLOAD, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type here, let the browser set it with the boundary
      }
    });
  }

  async processReceiptOCR(receiptUrl: string): Promise<{
    merchantName: string;
    date: string;
    total: number;
    items: Array<{ description: string; amount: number }>;
  }> {
    return this.request(API_ENDPOINTS.RECEIPTS.OCR, {
      method: 'POST',
      body: { receiptUrl }
    });
  }

  async getReceiptsByTransaction(transactionId: string): Promise<Array<{ url: string; processedData?: any }>> {
    return this.request(`${API_ENDPOINTS.RECEIPTS.BASE}/transaction/${transactionId}`);
  }

  // Enhanced Analytics endpoints
  async getSpendingByCategory(params: {
    startDate: Date;
    endDate: Date;
    groupBy: 'day' | 'week' | 'month' | 'year';
  }): Promise<Array<{
    category: string;
    amount: number;
    count: number;
    periodStart: string;
    periodEnd: string;
  }>> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
      groupBy: params.groupBy
    });

    return this.request(`${API_ENDPOINTS.ANALYTICS.SPENDING}?${queryParams}`);
  }

  async getTrends(params: {
    months: number;
    categories?: string[];
  }): Promise<Array<{
    category: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    percentageChange: number;
    averageSpend: number;
  }>> {
    const queryParams = new URLSearchParams({
      months: params.months.toString(),
      ...(params.categories && { categories: params.categories.join(',') })
    });

    return this.request(`${API_ENDPOINTS.ANALYTICS.TRENDS}?${queryParams}`);
  }

  // Teller integration endpoints
  async syncBankTransactions(): Promise<{ message: string }> {
    return this.request(API_ENDPOINTS.TRANSACTIONS.SYNC, {
      method: 'POST'
    });
  }
}

export const apiClient = new ApiClient(process.env.API_BASE_URL); 