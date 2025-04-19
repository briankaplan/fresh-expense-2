Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = void 0;
const constants_1 = require("@fresh-expense/constants");
class ApiError extends Error {
  statusCode;
  data;
  constructor(message, statusCode, data) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.name = "ApiError";
  }
}
class ApiClient {
  baseUrl;
  token = null;
  constructor(baseUrl = "") {
    this.baseUrl = baseUrl;
  }
  setToken(token) {
    this.token = token;
  }
  async request(endpoint, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(data.message || "An error occurred", response.status, data);
    }
    return data;
  }
  // Auth endpoints
  async login(email, password) {
    return this.request(constants_1.API_ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: { email, password },
    });
  }
  async register(userData) {
    return this.request(constants_1.API_ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      body: userData,
    });
  }
  async logout() {
    return this.request(constants_1.API_ENDPOINTS.AUTH.LOGOUT, {
      method: "POST",
    });
  }
  // Transaction endpoints
  async getTransactions(params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    return this.request(`${constants_1.API_ENDPOINTS.TRANSACTIONS.BASE}?${queryParams}`);
  }
  async createTransaction(transaction) {
    return this.request(constants_1.API_ENDPOINTS.TRANSACTIONS.BASE, {
      method: "POST",
      body: transaction,
    });
  }
  async updateTransaction(id, updates) {
    return this.request(`${constants_1.API_ENDPOINTS.TRANSACTIONS.BASE}/${id}`, {
      method: "PUT",
      body: updates,
    });
  }
  // Company endpoints
  async getCompanies() {
    return this.request("/api/companies");
  }
  async createCompany(company) {
    return this.request("/api/companies", {
      method: "POST",
      body: company,
    });
  }
  async updateCompany(id, updates) {
    return this.request(`/api/companies/${id}`, {
      method: "PUT",
      body: updates,
    });
  }
  // Analytics endpoints
  async getAnalytics(params) {
    const queryParams = new URLSearchParams({
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
      period: params.period,
    });
    return this.request(`${constants_1.API_ENDPOINTS.ANALYTICS.BASE}?${queryParams}`);
  }
  // Receipt endpoints
  async uploadReceipt(file) {
    const formData = new FormData();
    formData.append("receipt", file);
    return this.request(constants_1.API_ENDPOINTS.RECEIPTS.UPLOAD, {
      method: "POST",
      body: formData,
      headers: {
        // Don't set Content-Type here, let the browser set it with the boundary
      },
    });
  }
  async processReceiptOCR(receiptUrl) {
    return this.request(constants_1.API_ENDPOINTS.RECEIPTS.OCR, {
      method: "POST",
      body: { receiptUrl },
    });
  }
  async getReceiptsByTransaction(transactionId) {
    return this.request(`${constants_1.API_ENDPOINTS.RECEIPTS.BASE}/transaction/${transactionId}`);
  }
  // Enhanced Analytics endpoints
  async getSpendingByCategory(params) {
    const queryParams = new URLSearchParams({
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
      groupBy: params.groupBy,
    });
    return this.request(`${constants_1.API_ENDPOINTS.ANALYTICS.SPENDING}?${queryParams}`);
  }
  async getTrends(params) {
    const queryParams = new URLSearchParams({
      months: params.months.toString(),
      ...(params.categories && { categories: params.categories.join(",") }),
    });
    return this.request(`${constants_1.API_ENDPOINTS.ANALYTICS.TRENDS}?${queryParams}`);
  }
  // Teller integration endpoints
  async syncBankTransactions() {
    return this.request(constants_1.API_ENDPOINTS.TRANSACTIONS.SYNC, {
      method: "POST",
    });
  }
}
exports.apiClient = new ApiClient(process.env.API_BASE_URL);
//# sourceMappingURL=index.js.map
