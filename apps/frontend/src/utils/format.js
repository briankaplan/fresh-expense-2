"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = exports.formatPercentage = exports.formatCurrency = void 0;
const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};
exports.formatCurrency = formatCurrency;
const formatPercentage = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(value / 100);
};
exports.formatPercentage = formatPercentage;
const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(date));
};
exports.formatDate = formatDate;
//# sourceMappingURL=format.js.map