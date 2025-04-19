"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSpendingAnalytics = void 0;
const react_1 = require("react");
const useSpendingAnalytics = () => {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [data, setData] = (0, react_1.useState)({
        totalSpending: 0,
        spendingByCategory: {},
        spendingTrends: [],
        topMerchants: [],
    });
    const fetchAnalytics = async (startDate, endDate) => {
        try {
            setLoading(true);
            const response = await fetch('/api/analytics/spending', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ startDate, endDate }),
            });
            if (!response.ok) {
                throw new Error('Failed to fetch spending analytics');
            }
            const analyticsData = await response.json();
            setData(analyticsData);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
        finally {
            setLoading(false);
        }
    };
    return {
        loading,
        error,
        data,
        fetchAnalytics,
    };
};
exports.useSpendingAnalytics = useSpendingAnalytics;
//# sourceMappingURL=useSpendingAnalytics.js.map