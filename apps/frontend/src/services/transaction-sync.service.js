const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __importDefault(require("./api"));
const transactionSyncService = {
  async getSyncStatus() {
    try {
      const response = await api_1.default.get("/transactions/sync/status");
      return response.data;
    } catch (error) {
      const apiError = error;
      throw new Error(apiError.message || "Failed to get sync status");
    }
  },
  async startSync() {
    try {
      await api_1.default.post("/transactions/sync/start");
    } catch (error) {
      const apiError = error;
      throw new Error(apiError.message || "Failed to start sync");
    }
  },
  async getPendingTransactions() {
    try {
      const response = await api_1.default.get("/transactions/pending");
      return response.data;
    } catch (error) {
      const apiError = error;
      throw new Error(apiError.message || "Failed to get pending transactions");
    }
  },
  async getSyncProgress() {
    try {
      const response = await api_1.default.get("/transactions/sync/progress");
      return response.data;
    } catch (error) {
      const apiError = error;
      throw new Error(apiError.message || "Failed to get sync progress");
    }
  },
  async cancelSync() {
    try {
      await api_1.default.post("/transactions/sync/cancel");
    } catch (error) {
      const apiError = error;
      throw new Error(apiError.message || "Failed to cancel sync");
    }
  },
  async retryFailedSync() {
    try {
      await api_1.default.post("/transactions/sync/retry");
    } catch (error) {
      const apiError = error;
      throw new Error(apiError.message || "Failed to retry sync");
    }
  },
};
exports.default = transactionSyncService;
//# sourceMappingURL=transaction-sync.service.js.map
