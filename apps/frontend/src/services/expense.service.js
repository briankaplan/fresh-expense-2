"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __importDefault(require("./api"));
class ExpenseService {
    static instance;
    baseUrl = '/api/expenses';
    constructor() { }
    static getInstance() {
        if (!ExpenseService.instance) {
            ExpenseService.instance = new ExpenseService();
        }
        return ExpenseService.instance;
    }
    async getExpenses(filters) {
        const response = await api_1.default.get(this.baseUrl, { params: filters });
        return response.data;
    }
    async getExpense(id) {
        const response = await api_1.default.get(`${this.baseUrl}/${id}`);
        return response.data;
    }
    async createExpense(expense) {
        const response = await api_1.default.post(this.baseUrl, expense);
        return response.data;
    }
    async updateExpense(id, expense) {
        const response = await api_1.default.patch(`${this.baseUrl}/${id}`, expense);
        return response.data;
    }
    async deleteExpense(id) {
        await api_1.default.delete(`${this.baseUrl}/${id}`);
    }
    async bulkDeleteExpenses(ids) {
        await api_1.default.post(`${this.baseUrl}/bulk-delete`, { ids });
    }
    async bulkUpdateExpenses(ids, updates) {
        const response = await api_1.default.patch(`${this.baseUrl}/bulk-update`, {
            ids,
            updates,
        });
        return response.data;
    }
    async bulkAddLabel(ids, label) {
        const response = await api_1.default.post(`${this.baseUrl}/bulk-label`, {
            ids,
            label,
        });
        return response.data;
    }
    async bulkShareExpenses(ids) {
        const response = await api_1.default.post(`${this.baseUrl}/bulk-share`, {
            ids,
        });
        return response.data;
    }
    async getCategories() {
        const response = await api_1.default.get(`${this.baseUrl}/categories`);
        return response.data;
    }
    async getMerchants() {
        const response = await api_1.default.get(`${this.baseUrl}/merchants`);
        return response.data;
    }
    async exportExpenses(format, filters) {
        const response = await api_1.default.get(`${this.baseUrl}/export`, {
            params: { ...filters, format },
            responseType: 'blob',
        });
        return response.data;
    }
    async getExpenseSummary(filters = {}) {
        try {
            const response = await api_1.default.get(`${this.baseUrl}/summary`, { params: filters });
            return response.data;
        }
        catch (error) {
            const apiError = error;
            throw new Error(apiError.message || 'Failed to fetch expense summary');
        }
    }
}
exports.default = ExpenseService;
//# sourceMappingURL=expense.service.js.map