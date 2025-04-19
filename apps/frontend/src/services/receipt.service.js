Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptService = void 0;
const api_1 = require("./api");
class ReceiptService {
  static async uploadReceipt(transactionId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api_1.api.post(`/receipts/${transactionId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
  static async getReceipt(transactionId) {
    const response = await api_1.api.get(`/receipts/${transactionId}`);
    return response.data;
  }
  static async deleteReceipt(transactionId) {
    await api_1.api.delete(`/receipts/${transactionId}`);
  }
  static async downloadReceipt(receiptId) {
    const response = await api_1.api.get(`/receipts/${receiptId}/download`, {
      responseType: "blob",
    });
    return response.data;
  }
  static async updateReceipt(receiptId, updates) {
    const response = await api_1.api.patch(`/receipts/${receiptId}`, updates);
    return response.data;
  }
  static async linkTransaction(receiptId, transactionId) {
    const response = await api_1.api.post(`/receipts/${receiptId}/link`, {
      transactionId,
    });
    return response.data;
  }
  static async unlinkTransaction(receiptId) {
    const response = await api_1.api.post(`/receipts/${receiptId}/unlink`);
    return response.data;
  }
}
exports.ReceiptService = ReceiptService;
//# sourceMappingURL=receipt.service.js.map
