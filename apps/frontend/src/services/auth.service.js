"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __importDefault(require("./api"));
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const authService = {
    async login(credentials) {
        try {
            const response = await api_1.default.post('/auth/login', credentials);
            return response.data;
        }
        catch (error) {
            const apiError = error;
            throw new Error(apiError.message || 'Login failed');
        }
    },
    async register(data) {
        try {
            const response = await api_1.default.post('/auth/register', data);
            return response.data;
        }
        catch (error) {
            const apiError = error;
            throw new Error(apiError.message || 'Registration failed');
        }
    },
    async logout() {
        try {
            await api_1.default.post('/auth/logout');
        }
        catch (error) {
            console.error('Logout error:', error);
        }
        finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        }
    },
    async getCurrentUser() {
        try {
            const response = await api_1.default.get('/auth/me');
            return response.data;
        }
        catch (error) {
            const apiError = error;
            throw new Error(apiError.message || 'Failed to get current user');
        }
    },
    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('No refresh token found');
            }
            const response = await api_1.default.post('/auth/refresh', {
                refreshToken,
            });
            return response.data;
        }
        catch (error) {
            const apiError = error;
            throw new Error(apiError.message || 'Failed to refresh token');
        }
    },
    async updatePassword(currentPassword, newPassword) {
        try {
            await api_1.default.patch('/auth/password', {
                currentPassword,
                newPassword,
            });
        }
        catch (error) {
            const apiError = error;
            throw new Error(apiError.message || 'Failed to update password');
        }
    },
    async forgotPassword(email) {
        try {
            await api_1.default.post('/auth/forgot-password', { email });
        }
        catch (error) {
            const apiError = error;
            throw new Error(apiError.message || 'Failed to send password reset email');
        }
    },
    async resetPassword(token, newPassword) {
        try {
            await api_1.default.post('/auth/reset-password', { token, newPassword });
        }
        catch (error) {
            const apiError = error;
            throw new Error(apiError.message || 'Failed to reset password');
        }
    },
};
exports.default = authService;
//# sourceMappingURL=auth.service.js.map