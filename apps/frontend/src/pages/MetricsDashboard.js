"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const recharts_1 = require("recharts");
const AuthContext_1 = require("../context/AuthContext");
const metrics_service_1 = require("../services/metrics.service");
const MetricsDashboard = () => {
    const theme = (0, material_1.useTheme)();
    const { user } = (0, AuthContext_1.useAuth)();
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [metrics, setMetrics] = (0, react_1.useState)([]);
    const [aggregatedData, setAggregatedData] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const fetchMetrics = async () => {
            try {
                setLoading(true);
                const queryParams = {
                    userId: user?.id,
                    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                    endDate: new Date(),
                };
                const [metricsData, aggregatedMetrics] = await Promise.all([
                    metrics_service_1.metricsService.findAll(queryParams),
                    metrics_service_1.metricsService.aggregateMetrics(queryParams),
                ]);
                setMetrics(metricsData);
                setAggregatedData(aggregatedMetrics);
            }
            catch (err) {
                setError('Failed to fetch metrics data');
                console.error('Error fetching metrics:', err);
            }
            finally {
                setLoading(false);
            }
        };
        if (user?.id) {
            fetchMetrics();
        }
    }, [user?.id]);
    if (loading) {
        return (<material_1.Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <material_1.CircularProgress />
      </material_1.Box>);
    }
    if (error) {
        return (<material_1.Box p={3}>
        <material_1.Typography color="error">{error}</material_1.Typography>
      </material_1.Box>);
    }
    const formatChartData = (metrics) => {
        const dailyData = {};
        metrics.forEach(metric => {
            const date = new Date(metric.createdAt).toISOString().split('T')[0];
            if (!dailyData[date]) {
                dailyData[date] = { date, value: 0 };
            }
            dailyData[date].value += metric.value;
        });
        return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
    };
    const chartData = formatChartData(metrics);
    return (<material_1.Box p={3}>
      <material_1.Typography variant="h4" gutterBottom>
        Metrics Dashboard
      </material_1.Typography>

      <material_1.Grid container spacing={3}>
        {/* Summary Cards */}
        <material_1.Grid item xs={12} md={4}>
          <material_1.Paper sx={{ p: 2 }}>
            <material_1.Typography variant="h6" gutterBottom>
              Total Expenses
            </material_1.Typography>
            <material_1.Typography variant="h4">${aggregatedData?.total?.toFixed(2) || '0.00'}</material_1.Typography>
          </material_1.Paper>
        </material_1.Grid>

        <material_1.Grid item xs={12} md={4}>
          <material_1.Paper sx={{ p: 2 }}>
            <material_1.Typography variant="h6" gutterBottom>
              Average Daily Expense
            </material_1.Typography>
            <material_1.Typography variant="h4">${aggregatedData?.average?.toFixed(2) || '0.00'}</material_1.Typography>
          </material_1.Paper>
        </material_1.Grid>

        <material_1.Grid item xs={12} md={4}>
          <material_1.Paper sx={{ p: 2 }}>
            <material_1.Typography variant="h6" gutterBottom>
              Number of Transactions
            </material_1.Typography>
            <material_1.Typography variant="h4">{aggregatedData?.count || 0}</material_1.Typography>
          </material_1.Paper>
        </material_1.Grid>

        {/* Chart */}
        <material_1.Grid item xs={12}>
          <material_1.Paper sx={{ p: 2 }}>
            <material_1.Typography variant="h6" gutterBottom>
              Expense Trends
            </material_1.Typography>
            <material_1.Box height={400}>
              <recharts_1.ResponsiveContainer width="100%" height="100%">
                <recharts_1.LineChart data={chartData}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                  <recharts_1.XAxis dataKey="date"/>
                  <recharts_1.YAxis />
                  <recharts_1.Tooltip />
                  <recharts_1.Legend />
                  <recharts_1.Line type="monotone" dataKey="value" stroke={theme.palette.primary.main} name="Daily Expenses"/>
                </recharts_1.LineChart>
              </recharts_1.ResponsiveContainer>
            </material_1.Box>
          </material_1.Paper>
        </material_1.Grid>
      </material_1.Grid>
    </material_1.Box>);
};
exports.default = MetricsDashboard;
//# sourceMappingURL=MetricsDashboard.js.map