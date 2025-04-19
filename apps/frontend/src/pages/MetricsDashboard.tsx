import { MetricType, type Metrics, type MetricsQueryParams } from "@fresh-expense/types";
import { Box, CircularProgress, Grid, Paper, Typography, useTheme } from "@mui/material";
import type React from "react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { metricsService } from "../services/metrics.service";

const MetricsDashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metrics[]>([]);
  const [aggregatedData, setAggregatedData] = useState<any>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const queryParams: MetricsQueryParams = {
          userId: user?.id,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          endDate: new Date(),
        };

        const [metricsData, aggregatedMetrics] = await Promise.all([
          metricsService.findAll(queryParams),
          metricsService.aggregateMetrics(queryParams),
        ]);

        setMetrics(metricsData);
        setAggregatedData(aggregatedMetrics);
      } catch (err) {
        setError("Failed to fetch metrics data");
        console.error("Error fetching metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchMetrics();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const formatChartData = (metrics: Metrics[]) => {
    const dailyData: { [key: string]: { date: string; value: number } } = {};

    metrics.forEach((metric) => {
      const date = new Date(metric.createdAt).toISOString().split("T")[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, value: 0 };
      }
      dailyData[date].value += metric.value;
    });

    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
  };

  const chartData = formatChartData(metrics);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Metrics Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total Expenses
            </Typography>
            <Typography variant="h4">${aggregatedData?.total?.toFixed(2) || "0.00"}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Average Daily Expense
            </Typography>
            <Typography variant="h4">${aggregatedData?.average?.toFixed(2) || "0.00"}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Number of Transactions
            </Typography>
            <Typography variant="h4">{aggregatedData?.count || 0}</Typography>
          </Paper>
        </Grid>

        {/* Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Expense Trends
            </Typography>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={theme.palette.primary.main}
                    name="Daily Expenses"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MetricsDashboard;
