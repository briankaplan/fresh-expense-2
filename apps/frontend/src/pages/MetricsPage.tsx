import type { MetricType, Metrics, MetricsQueryParams } from "@fresh-expense/types";
import {
  BarChart as BarChartIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { saveAs } from "file-saver";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip as ChartTooltip,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { utils as xlsxUtils } from "xlsx";
import { useAuth } from "../contexts/AuthContext";
import { useMetrics } from "../contexts/MetricsContext";

interface EnhancedMetricsQueryParams extends MetricsQueryParams {
  page: number;
  pageSize: number;
  sortBy?: keyof Metrics;
  sortOrder?: "asc" | "desc";
  minValue?: number;
  maxValue?: number;
}

interface ChartData {
  date?: string;
  name?: string;
  value: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const MetricsPage = () => {
  const { user } = useAuth();
  const { metrics, aggregatedData, loading, error, fetchMetrics, fetchAggregatedMetrics } =
    useMetrics();

  const [queryParams, setQueryParams] = useState<EnhancedMetricsQueryParams>({
    userId: user?.id || "",
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
    type: undefined,
    page: 0,
    pageSize: 10,
    sortBy: "date",
    sortOrder: "desc",
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [chartType, setChartType] = useState<"line" | "bar" | "pie">("line");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<"excel" | "csv" | "json">("excel");

  useEffect(() => {
    if (user?.id) {
      setQueryParams((prev) => ({ ...prev, userId: user.id }));
      fetchMetrics(queryParams);
      fetchAggregatedMetrics(queryParams);
    }
  }, [user?.id, fetchMetrics, fetchAggregatedMetrics, queryParams]);

  // Get unique categories and tags
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    metrics.forEach((metric) => {
      if (metric.category) uniqueCategories.add(metric.category);
    });
    return Array.from(uniqueCategories);
  }, [metrics]);

  const tags = useMemo(() => {
    const uniqueTags = new Set<string>();
    metrics.forEach((metric) => {
      metric.tags?.forEach((tag) => uniqueTags.add(tag));
    });
    return Array.from(uniqueTags);
  }, [metrics]);

  // Enhanced chart data
  const chartData = useMemo<ChartData[]>(() => {
    if (chartType === "pie") {
      const categoryData = metrics.reduce(
        (acc, metric) => {
          const category = metric.category || "Uncategorized";
          acc[category] = (acc[category] || 0) + metric.value;
          return acc;
        },
        {} as Record<string, number>,
      );

      return Object.entries(categoryData).map(([name, value]) => ({
        name,
        value,
      }));
    }

    const dailyTotals: Record<string, number> = {};
    metrics.forEach((metric) => {
      const date = new Date(metric.date).toISOString().split("T")[0];
      if (date) {
        dailyTotals[date] = (dailyTotals[date] || 0) + metric.value;
      }
    });

    return Object.entries(dailyTotals)
      .map(([date, value]) => ({ date, value }))
      .sort((a: ChartData, b: ChartData) => a.date!.localeCompare(b.date!));
  }, [metrics, chartType]);

  const handleDateChange = (field: "startDate" | "endDate", date: Date | null) => {
    if (date) {
      setQueryParams((prev) => ({ ...prev, [field]: date }));
    }
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQueryParams((prev) => ({
      ...prev,
      type: event.target.value as MetricType | undefined,
    }));
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQueryParams((prev) => ({
      ...prev,
      pageSize: Number.parseInt(event.target.value, 10),
      page: 0,
    }));
  };

  const handleSort = (property: keyof Metrics) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: property,
      sortOrder: prev.sortBy === property && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const handleExport = (format: "excel" | "csv" | "json") => {
    const headers = ["Date", "Type", "Category", "Value", "Description"];
    const data = metrics.map((metric: Metrics) => [
      new Date(metric.date).toLocaleDateString(),
      metric.type,
      metric.category || "",
      metric.value,
      metric.description || "",
    ]);

    switch (format) {
      case "excel":
        const worksheet = xlsxUtils.aoa_to_sheet([headers, ...data]);
        const workbook = xlsxUtils.book_new();
        xlsxUtils.book_append_sheet(workbook, worksheet, "Metrics");
        const excelBuffer = xlsxUtils.write(workbook, {
          type: "array",
          bookType: "xlsx",
        });
        saveAs(
          new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
          "metrics.xlsx",
        );
        break;
      case "csv":
        const csvContent = [headers, ...data].map((row) => row.join(",")).join("\n");
        const csvBlob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        saveAs(csvBlob, "metrics.csv");
        break;
      case "json":
        const jsonContent = JSON.stringify(metrics, null, 2);
        const jsonBlob = new Blob([jsonContent], { type: "application/json" });
        saveAs(jsonBlob, "metrics.json");
        break;
    }
  };

  const renderMetricsSummary = (data: MetricsSummary) => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Total Value</Typography>
            <Typography variant="h4">${data.total.toFixed(2)}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Average Value</Typography>
            <Typography variant="h4">${data.average.toFixed(2)}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Total Records</Typography>
            <Typography variant="h4">{data.count}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Metrics Filters</Typography>
                <Box>
                  <FormControl sx={{ minWidth: 120, mr: 2 }}>
                    <InputLabel>Export Format</InputLabel>
                    <Select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value as "excel" | "csv" | "json")}
                      label="Export Format"
                    >
                      <MenuItem value="excel">Excel</MenuItem>
                      <MenuItem value="csv">CSV</MenuItem>
                      <MenuItem value="json">JSON</MenuItem>
                    </Select>
                  </FormControl>
                  <Tooltip title="Export Data">
                    <IconButton onClick={() => handleExport(exportFormat)} color="primary">
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Advanced Filters">
                    <IconButton
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      color="primary"
                    >
                      <FilterListIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <DatePicker
                    label="Start Date"
                    value={queryParams.startDate}
                    onChange={(date) => handleDateChange("startDate", date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <DatePicker
                    label="End Date"
                    value={queryParams.endDate}
                    onChange={(date) => handleDateChange("endDate", date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    label="Metric Type"
                    value={queryParams.type || ""}
                    onChange={handleTypeChange}
                    fullWidth
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="expense">Expense</MenuItem>
                    <MenuItem value="income">Income</MenuItem>
                    <MenuItem value="savings">Savings</MenuItem>
                  </TextField>
                </Grid>
                {showAdvancedFilters && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        type="number"
                        label="Min Value"
                        value={queryParams.minValue || ""}
                        onChange={(e) =>
                          setQueryParams((prev) => ({
                            ...prev,
                            minValue: e.target.value ? Number(e.target.value) : undefined,
                          }))
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        type="number"
                        label="Max Value"
                        value={queryParams.maxValue || ""}
                        onChange={(e) =>
                          setQueryParams((prev) => ({
                            ...prev,
                            maxValue: e.target.value ? Number(e.target.value) : undefined,
                          }))
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Categories
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {categories.map((category) => (
                          <Chip
                            key={category}
                            label={category}
                            onClick={() =>
                              setSelectedCategories((prev) =>
                                prev.includes(category)
                                  ? prev.filter((c) => c !== category)
                                  : [...prev, category],
                              )
                            }
                            color={selectedCategories.includes(category) ? "primary" : "default"}
                          />
                        ))}
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Tags
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            onClick={() =>
                              setSelectedTags((prev) =>
                                prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
                              )
                            }
                            color={selectedTags.includes(tag) ? "primary" : "default"}
                          />
                        ))}
                      </Stack>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Metrics Visualization</Typography>
                <Tabs value={chartType} onChange={(_, value) => setChartType(value)}>
                  <Tab icon={<TimelineIcon />} value="line" label="Trend" />
                  <Tab icon={<BarChartIcon />} value="bar" label="Distribution" />
                  <Tab icon={<PieChartIcon />} value="pie" label="Categories" />
                </Tabs>
              </Box>
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <>
                    {chartType === "line" && (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    )}
                    {chartType === "bar" && (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    )}
                    {chartType === "pie" && (
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                        <Legend />
                      </PieChart>
                    )}
                  </>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {aggregatedData && (
          <Grid item xs={12}>
            <Box>{renderMetricsSummary(aggregatedData)}</Box>
          </Grid>
        )}

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Metrics List
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={queryParams.sortBy === "type"}
                          direction={queryParams.sortOrder}
                          onClick={() => handleSort("type")}
                        >
                          Type
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={queryParams.sortBy === "value"}
                          direction={queryParams.sortOrder}
                          onClick={() => handleSort("value")}
                        >
                          Value
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={queryParams.sortBy === "date"}
                          direction={queryParams.sortOrder}
                          onClick={() => handleSort("date")}
                        >
                          Date
                        </TableSortLabel>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metrics.map((metric: Metrics) => (
                      <TableRow key={metric._id}>
                        <TableCell>{metric.type}</TableCell>
                        <TableCell>${metric.value.toFixed(2)}</TableCell>
                        <TableCell>{new Date(metric.date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={metrics.length}
                rowsPerPage={queryParams.pageSize}
                page={queryParams.page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handlePageSizeChange}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MetricsPage;
