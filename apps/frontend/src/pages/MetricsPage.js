var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: () => m[k],
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : (o, v) => {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (() => {
    var ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const DatePicker_1 = require("@mui/x-date-pickers/DatePicker");
const MetricsContext_1 = require("../contexts/MetricsContext");
const recharts_1 = require("recharts");
const icons_material_1 = require("@mui/icons-material");
const file_saver_1 = require("file-saver");
const xlsx_1 = require("xlsx");
const AuthContext_1 = require("../contexts/AuthContext");
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const MetricsPage = () => {
  const { user } = (0, AuthContext_1.useAuth)();
  const { metrics, aggregatedData, loading, error, fetchMetrics, fetchAggregatedMetrics } = (0,
  MetricsContext_1.useMetrics)();
  const [queryParams, setQueryParams] = (0, react_1.useState)({
    userId: user?.id || "",
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
    type: undefined,
    page: 0,
    pageSize: 10,
    sortBy: "date",
    sortOrder: "desc",
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = (0, react_1.useState)(false);
  const [chartType, setChartType] = (0, react_1.useState)("line");
  const [selectedCategories, setSelectedCategories] = (0, react_1.useState)([]);
  const [selectedTags, setSelectedTags] = (0, react_1.useState)([]);
  const [exportFormat, setExportFormat] = (0, react_1.useState)("excel");
  (0, react_1.useEffect)(() => {
    if (user?.id) {
      setQueryParams((prev) => ({ ...prev, userId: user.id }));
      fetchMetrics(queryParams);
      fetchAggregatedMetrics(queryParams);
    }
  }, [user?.id, fetchMetrics, fetchAggregatedMetrics, queryParams]);
  // Get unique categories and tags
  const categories = (0, react_1.useMemo)(() => {
    const uniqueCategories = new Set();
    metrics.forEach((metric) => {
      if (metric.category) uniqueCategories.add(metric.category);
    });
    return Array.from(uniqueCategories);
  }, [metrics]);
  const tags = (0, react_1.useMemo)(() => {
    const uniqueTags = new Set();
    metrics.forEach((metric) => {
      metric.tags?.forEach((tag) => uniqueTags.add(tag));
    });
    return Array.from(uniqueTags);
  }, [metrics]);
  // Enhanced chart data
  const chartData = (0, react_1.useMemo)(() => {
    if (chartType === "pie") {
      const categoryData = metrics.reduce((acc, metric) => {
        const category = metric.category || "Uncategorized";
        acc[category] = (acc[category] || 0) + metric.value;
        return acc;
      }, {});
      return Object.entries(categoryData).map(([name, value]) => ({
        name,
        value,
      }));
    }
    const dailyTotals = {};
    metrics.forEach((metric) => {
      const date = new Date(metric.date).toISOString().split("T")[0];
      if (date) {
        dailyTotals[date] = (dailyTotals[date] || 0) + metric.value;
      }
    });
    return Object.entries(dailyTotals)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [metrics, chartType]);
  const handleDateChange = (field, date) => {
    if (date) {
      setQueryParams((prev) => ({ ...prev, [field]: date }));
    }
  };
  const handleTypeChange = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      type: event.target.value,
    }));
  };
  const handlePageChange = (_, newPage) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }));
  };
  const handlePageSizeChange = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      pageSize: Number.parseInt(event.target.value, 10),
      page: 0,
    }));
  };
  const handleSort = (property) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: property,
      sortOrder: prev.sortBy === property && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };
  const handleExport = (format) => {
    const headers = ["Date", "Type", "Category", "Value", "Description"];
    const data = metrics.map((metric) => [
      new Date(metric.date).toLocaleDateString(),
      metric.type,
      metric.category || "",
      metric.value,
      metric.description || "",
    ]);
    switch (format) {
      case "excel":
        const worksheet = xlsx_1.utils.aoa_to_sheet([headers, ...data]);
        const workbook = xlsx_1.utils.book_new();
        xlsx_1.utils.book_append_sheet(workbook, worksheet, "Metrics");
        const excelBuffer = xlsx_1.utils.write(workbook, {
          type: "array",
          bookType: "xlsx",
        });
        (0, file_saver_1.saveAs)(
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
        (0, file_saver_1.saveAs)(csvBlob, "metrics.csv");
        break;
      case "json":
        const jsonContent = JSON.stringify(metrics, null, 2);
        const jsonBlob = new Blob([jsonContent], { type: "application/json" });
        (0, file_saver_1.saveAs)(jsonBlob, "metrics.json");
        break;
    }
  };
  const renderMetricsSummary = (data) => (
    <material_1.Grid container spacing={2}>
      <material_1.Grid item xs={12} sm={6} md={3}>
        <material_1.Card>
          <material_1.CardContent>
            <material_1.Typography variant="h6">Total Value</material_1.Typography>
            <material_1.Typography variant="h4">${data.total.toFixed(2)}</material_1.Typography>
          </material_1.CardContent>
        </material_1.Card>
      </material_1.Grid>
      <material_1.Grid item xs={12} sm={6} md={3}>
        <material_1.Card>
          <material_1.CardContent>
            <material_1.Typography variant="h6">Average Value</material_1.Typography>
            <material_1.Typography variant="h4">${data.average.toFixed(2)}</material_1.Typography>
          </material_1.CardContent>
        </material_1.Card>
      </material_1.Grid>
      <material_1.Grid item xs={12} sm={6} md={3}>
        <material_1.Card>
          <material_1.CardContent>
            <material_1.Typography variant="h6">Total Records</material_1.Typography>
            <material_1.Typography variant="h4">{data.count}</material_1.Typography>
          </material_1.CardContent>
        </material_1.Card>
      </material_1.Grid>
    </material_1.Grid>
  );
  if (loading) {
    return (
      <material_1.Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <material_1.CircularProgress />
      </material_1.Box>
    );
  }
  if (error) {
    return (
      <material_1.Box p={3}>
        <material_1.Alert severity="error">{error}</material_1.Alert>
      </material_1.Box>
    );
  }
  return (
    <material_1.Box p={3}>
      <material_1.Grid container spacing={3}>
        <material_1.Grid item xs={12}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <material_1.Typography variant="h5">Metrics Filters</material_1.Typography>
                <material_1.Box>
                  <material_1.FormControl sx={{ minWidth: 120, mr: 2 }}>
                    <material_1.InputLabel>Export Format</material_1.InputLabel>
                    <material_1.Select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      label="Export Format"
                    >
                      <material_1.MenuItem value="excel">Excel</material_1.MenuItem>
                      <material_1.MenuItem value="csv">CSV</material_1.MenuItem>
                      <material_1.MenuItem value="json">JSON</material_1.MenuItem>
                    </material_1.Select>
                  </material_1.FormControl>
                  <material_1.Tooltip title="Export Data">
                    <material_1.IconButton
                      onClick={() => handleExport(exportFormat)}
                      color="primary"
                    >
                      <icons_material_1.Download />
                    </material_1.IconButton>
                  </material_1.Tooltip>
                  <material_1.Tooltip title="Advanced Filters">
                    <material_1.IconButton
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      color="primary"
                    >
                      <icons_material_1.FilterList />
                    </material_1.IconButton>
                  </material_1.Tooltip>
                </material_1.Box>
              </material_1.Box>
              <material_1.Grid container spacing={2}>
                <material_1.Grid item xs={12} sm={4}>
                  <DatePicker_1.DatePicker
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
                </material_1.Grid>
                <material_1.Grid item xs={12} sm={4}>
                  <DatePicker_1.DatePicker
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
                </material_1.Grid>
                <material_1.Grid item xs={12} sm={4}>
                  <material_1.TextField
                    select
                    label="Metric Type"
                    value={queryParams.type || ""}
                    onChange={handleTypeChange}
                    fullWidth
                  >
                    <material_1.MenuItem value="">All Types</material_1.MenuItem>
                    <material_1.MenuItem value="expense">Expense</material_1.MenuItem>
                    <material_1.MenuItem value="income">Income</material_1.MenuItem>
                    <material_1.MenuItem value="savings">Savings</material_1.MenuItem>
                  </material_1.TextField>
                </material_1.Grid>
                {showAdvancedFilters && (
                  <>
                    <material_1.Grid item xs={12} sm={6}>
                      <material_1.TextField
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
                    </material_1.Grid>
                    <material_1.Grid item xs={12} sm={6}>
                      <material_1.TextField
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
                    </material_1.Grid>
                    <material_1.Grid item xs={12}>
                      <material_1.Typography variant="subtitle2" gutterBottom>
                        Categories
                      </material_1.Typography>
                      <material_1.Stack direction="row" spacing={1} flexWrap="wrap">
                        {categories.map((category) => (
                          <material_1.Chip
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
                      </material_1.Stack>
                    </material_1.Grid>
                    <material_1.Grid item xs={12}>
                      <material_1.Typography variant="subtitle2" gutterBottom>
                        Tags
                      </material_1.Typography>
                      <material_1.Stack direction="row" spacing={1} flexWrap="wrap">
                        {tags.map((tag) => (
                          <material_1.Chip
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
                      </material_1.Stack>
                    </material_1.Grid>
                  </>
                )}
              </material_1.Grid>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        <material_1.Grid item xs={12}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <material_1.Typography variant="h5">Metrics Visualization</material_1.Typography>
                <material_1.Tabs value={chartType} onChange={(_, value) => setChartType(value)}>
                  <material_1.Tab icon={<icons_material_1.Timeline />} value="line" label="Trend" />
                  <material_1.Tab
                    icon={<icons_material_1.BarChart />}
                    value="bar"
                    label="Distribution"
                  />
                  <material_1.Tab
                    icon={<icons_material_1.PieChart />}
                    value="pie"
                    label="Categories"
                  />
                </material_1.Tabs>
              </material_1.Box>
              <material_1.Box height={400}>
                <recharts_1.ResponsiveContainer width="100%" height="100%">
                  <>
                    {chartType === "line" && (
                      <recharts_1.LineChart data={chartData}>
                        <recharts_1.CartesianGrid strokeDasharray="3 3" />
                        <recharts_1.XAxis dataKey="date" />
                        <recharts_1.YAxis />
                        <recharts_1.Tooltip />
                        <recharts_1.Legend />
                        <recharts_1.Line
                          type="monotone"
                          dataKey="value"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                      </recharts_1.LineChart>
                    )}
                    {chartType === "bar" && (
                      <recharts_1.BarChart data={chartData}>
                        <recharts_1.CartesianGrid strokeDasharray="3 3" />
                        <recharts_1.XAxis dataKey="date" />
                        <recharts_1.YAxis />
                        <recharts_1.Tooltip />
                        <recharts_1.Legend />
                        <recharts_1.Bar dataKey="value" fill="#8884d8" />
                      </recharts_1.BarChart>
                    )}
                    {chartType === "pie" && (
                      <recharts_1.PieChart>
                        <recharts_1.Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {chartData.map((_, index) => (
                            <recharts_1.Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </recharts_1.Pie>
                        <recharts_1.Tooltip />
                        <recharts_1.Legend />
                      </recharts_1.PieChart>
                    )}
                  </>
                </recharts_1.ResponsiveContainer>
              </material_1.Box>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        {aggregatedData && (
          <material_1.Grid item xs={12}>
            <material_1.Box>{renderMetricsSummary(aggregatedData)}</material_1.Box>
          </material_1.Grid>
        )}

        <material_1.Grid item xs={12}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Typography variant="h5" gutterBottom>
                Metrics List
              </material_1.Typography>
              <material_1.TableContainer>
                <material_1.Table>
                  <material_1.TableHead>
                    <material_1.TableRow>
                      <material_1.TableCell>
                        <material_1.TableSortLabel
                          active={queryParams.sortBy === "type"}
                          direction={queryParams.sortOrder}
                          onClick={() => handleSort("type")}
                        >
                          Type
                        </material_1.TableSortLabel>
                      </material_1.TableCell>
                      <material_1.TableCell>
                        <material_1.TableSortLabel
                          active={queryParams.sortBy === "value"}
                          direction={queryParams.sortOrder}
                          onClick={() => handleSort("value")}
                        >
                          Value
                        </material_1.TableSortLabel>
                      </material_1.TableCell>
                      <material_1.TableCell>
                        <material_1.TableSortLabel
                          active={queryParams.sortBy === "date"}
                          direction={queryParams.sortOrder}
                          onClick={() => handleSort("date")}
                        >
                          Date
                        </material_1.TableSortLabel>
                      </material_1.TableCell>
                    </material_1.TableRow>
                  </material_1.TableHead>
                  <material_1.TableBody>
                    {metrics.map((metric) => (
                      <material_1.TableRow key={metric._id}>
                        <material_1.TableCell>{metric.type}</material_1.TableCell>
                        <material_1.TableCell>${metric.value.toFixed(2)}</material_1.TableCell>
                        <material_1.TableCell>
                          {new Date(metric.date).toLocaleDateString()}
                        </material_1.TableCell>
                      </material_1.TableRow>
                    ))}
                  </material_1.TableBody>
                </material_1.Table>
              </material_1.TableContainer>
              <material_1.TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={metrics.length}
                rowsPerPage={queryParams.pageSize}
                page={queryParams.page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handlePageSizeChange}
              />
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>
      </material_1.Grid>
    </material_1.Box>
  );
};
exports.default = MetricsPage;
//# sourceMappingURL=MetricsPage.js.map
