"use strict";
/**
 * Core application data models
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReceipt = exports.isTransaction = exports.isUser = void 0;
// API Response types
// Type guard functions for runtime type checking
const isUser = (obj) => {
    return (obj &&
        typeof obj.id === 'string' &&
        typeof obj.email === 'string' &&
        typeof obj.firstName === 'string' &&
        typeof obj.lastName === 'string' &&
        ['admin', 'user', 'accountant'].includes(obj.role) &&
        Array.isArray(obj.companies));
};
exports.isUser = isUser;
const isTransaction = (obj) => {
    return (obj &&
        typeof obj.id === 'string' &&
        obj.date instanceof Date &&
        typeof obj.merchant === 'string' &&
        typeof obj.amount === 'number' &&
        typeof obj.description === 'string' &&
        typeof obj.category === 'string' &&
        Array.isArray(obj.tags));
};
exports.isTransaction = isTransaction;
const isReceipt = (obj) => {
    return (obj &&
        typeof obj.id === 'string' &&
        typeof obj.filename === 'string' &&
        typeof obj.storageKey === 'string' &&
        typeof obj.mimeType === 'string' &&
        typeof obj.size === 'number' &&
        obj.uploadDate instanceof Date);
};
exports.isReceipt = isReceipt;
//# sourceMappingURL=models.js.map