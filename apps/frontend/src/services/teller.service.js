var __importDefault =
  (this && this.__importDefault) || ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __importDefault(require("./api"));
const tellerService = {
  async getAccounts() {
    try {
      const response = await api_1.default.get("/teller/accounts");
      return response.data;
    } catch (error) {
      const apiError = error;
      throw new Error(apiError.message || "Failed to fetch Teller accounts");
    }
  },
  async getAccount(accountId) {
    try {
      const response = await api_1.default.get(`/teller/accounts/${accountId}`);
      return response.data;
    } catch (error) {
      const apiError = error;
      throw new Error(apiError.message || "Failed to fetch Teller account");
    }
  },
  async syncTransactions(accountId) {
    try {
      await api_1.default.post(`/teller/accounts/${accountId}/sync`);
    } catch (error) {
      const apiError = error;
      throw new Error(apiError.message || "Failed to sync Teller transactions");
    }
  },
  async getTransactions(accountId, startDate, endDate) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      const response = await api_1.default.get(
        `/teller/accounts/${accountId}/transactions?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      const apiError = error;
      throw new Error(apiError.message || "Failed to fetch Teller transactions");
    }
  },
  async handleWebhook(event) {
    try {
      // Verify webhook signature
      const signature = event.data.timestamp;
      if (signature !== import.meta.env.VITE_TELLER_WEBHOOK_SECRET) {
        throw new Error("Invalid webhook signature");
      }
      await api_1.default.post("/teller/webhook", event);
    } catch (error) {
      const apiError = error;
      throw new Error(apiError.message || "Failed to process Teller webhook");
    }
  },
  async disconnectAccount(accountId) {
    try {
      await api_1.default.delete(`/teller/accounts/${accountId}`);
    } catch (error) {
      const apiError = error;
      throw new Error(apiError.message || "Failed to disconnect Teller account");
    }
  },
};
exports.default = tellerService;
//# sourceMappingURL=teller.service.js.map
