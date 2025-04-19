"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const instance = axios_1.default.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
});
// Add a request interceptor
instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});
// Add a response interceptor
instance.interceptors.response.use(response => response, async (error) => {
    if (error.response?.status != null) {
        // Handle token refresh or logout
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});
exports.default = instance;
//# sourceMappingURL=axios.js.map