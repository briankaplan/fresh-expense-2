"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthService = void 0;
const react_hot_toast_1 = require("react-hot-toast");
const api_1 = __importDefault(require("./api"));
class HealthService {
    static instance;
    checkInterval = 30000; // 30 seconds
    intervalId;
    constructor() {
        // Private constructor for singleton
    }
    static getInstance() {
        if (!HealthService.instance) {
            HealthService.instance = new HealthService();
        }
        return HealthService.instance;
    }
    async checkHealth() {
        try {
            const response = await api_1.default.get('/api/health');
            return response.data;
        }
        catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    }
    startHealthCheck() {
        // Clear any existing interval
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        // Perform initial check
        this.performHealthCheck();
        // Set up interval for subsequent checks
        this.intervalId = setInterval(() => {
            this.performHealthCheck();
        }, this.checkInterval);
    }
    stopHealthCheck() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
        }
    }
    async performHealthCheck() {
        try {
            const health = await this.checkHealth();
            if (health.status !== 'healthy') {
                react_hot_toast_1.toast.error('Some services are currently degraded');
                console.warn('Health check warning:', health);
            }
        }
        catch (error) {
            react_hot_toast_1.toast.error('Unable to connect to the server');
            console.error('Health check error:', error);
        }
    }
}
exports.healthService = HealthService.getInstance();
exports.default = exports.healthService;
//# sourceMappingURL=health.service.js.map