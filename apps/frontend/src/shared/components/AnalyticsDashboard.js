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
exports.AnalyticsDashboard = void 0;
const react_1 = __importStar(require("react"));
const hooks_1 = require("@fresh-expense/hooks");
const antd_1 = require("antd");
const icons_1 = require("@ant-design/icons");
const plots_1 = require("@ant-design/plots");
const { RangePicker } = antd_1.DatePicker;
const { Option } = antd_1.Select;
const { Search } = antd_1.Input;
const AnalyticsDashboard = () => {
  const [period, setPeriod] = (0, react_1.useState)("month");
  const [dateRange, setDateRange] = (0, react_1.useState)([
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
    new Date(),
  ]);
  const [filters, setFilters] = (0, react_1.useState)({
    dateRange: null,
    category: "",
    merchant: { name: "" },
    minAmount: null,
    maxAmount: null,
  });
  const [tableParams, setTableParams] = (0, react_1.useState)({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    sortField: "amount",
    sortOrder: "descend",
  });
  const { data, loading: analyticsLoading } = (0, hooks_1.useSpendingAnalytics)(period);
  const { exportData, loading: exporting } = (0, hooks_1.useDataExport)();
  const topCategories = data?.topCategories || [];
  const spendingByCategory = data?.spendingByCategory || {};
  // Filter and sort category data
  const filteredCategories = (0, react_1.useMemo)(() => {
    if (!data?.topCategories) return [];
    return data.topCategories
      .filter((category) => {
        // Search filter
        if (
          filters.category &&
          !category.category.toLowerCase().includes(filters.category.toLowerCase())
        ) {
          return false;
        }
        // Amount range filter
        if (filters.minAmount && category.amount < filters.minAmount) {
          return false;
        }
        if (filters.maxAmount && category.amount > filters.maxAmount) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (tableParams.sortField != null) {
          return tableParams.sortOrder != null ? a.amount - b.amount : b.amount - a.amount;
        }
        if (tableParams.sortField != null) {
          return tableParams.sortOrder != null
            ? a.category.localeCompare(b.category)
            : b.category.localeCompare(a.category);
        }
        if (tableParams.sortField != null) {
          const aPerc = (a.amount / data.totalSpent) * 100;
          const bPerc = (b.amount / data.totalSpent) * 100;
          return tableParams.sortOrder != null ? aPerc - bPerc : bPerc - aPerc;
        }
        return 0;
      });
  }, [data, filters, tableParams]);
  // Handle table change
  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination: {
        current: pagination.current || 1,
        pageSize: pagination.pageSize || 10,
      },
      sortField: sorter.field || "amount",
      sortOrder: sorter.order || "descend",
    });
  };
  const handleExportTypeChange = (format) => {
    if (!data) return;
    exportData({
      format,
      startDate: filters.dateRange?.[0]?.toDate(),
      endDate: filters.dateRange?.[1]?.toDate(),
      categories: filters.category ? [filters.category] : undefined,
      merchants: filters.merchant ? [filters.merchant] : undefined,
    });
  };
  // Prepare chart data
  const spendingTrendData = data
    ? data.map((item) => ({
        date: new Date(item.date).toLocaleDateString(),
        amount: item.totalSpent,
      }))
    : [];
  const categoryData =
    data?.topCategories.map((cat) => ({
      category: cat.category,
      value: cat.amount,
    })) || [];
  const handleDateChange = (dates) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: dates,
    }));
  };
  const handleCategorySearch = (e) => {
    setFilters((prev) => ({
      ...prev,
      category: e.target.value,
    }));
  };
  const handleMerchantSearch = (e) => {
    setFilters((prev) => ({
      ...prev,
      merchant: e.target.value,
    }));
  };
  const handleAmountSearch = (e) => {
    setFilters((prev) => ({
      ...prev,
      minAmount: e.target.value ? Number.parseFloat(e.target.value) : null,
    }));
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };
  const renderAmount = (_, record) => {
    return formatCurrency(record.amount);
  };
  const renderCategoryRow = (category) => {
    return (
      <antd_1.Table.Row key={category.category}>
        <antd_1.Table.Cell>{category.category}</antd_1.Table.Cell>
        <antd_1.Table.Cell>{formatCurrency(category.amount)}</antd_1.Table.Cell>
        <antd_1.Table.Cell>{formatPercentage(category.percentage)}</antd_1.Table.Cell>
        <antd_1.Table.Cell>{category.trend}</antd_1.Table.Cell>
      </antd_1.Table.Row>
    );
  };
  return (
    <div className="analytics-dashboard">
      <antd_1.Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Controls */}
        <antd_1.Card>
          <antd_1.Row gutter={[16, 16]}>
            <antd_1.Col>
              <antd_1.Select value={period} onChange={setPeriod} style={{ width: 120 }}>
                <Option value="day">Daily</Option>
                <Option value="week">Weekly</Option>
                <Option value="month">Monthly</Option>
                <Option value="year">Yearly</Option>
              </antd_1.Select>
            </antd_1.Col>
            <antd_1.Col>
              <RangePicker value={[dateRange[0], dateRange[1]]} onChange={handleDateChange} />
            </antd_1.Col>
            <antd_1.Col>
              <antd_1.Space>
                <antd_1.Button
                  icon={<icons_1.DownloadOutlined />}
                  onClick={() => handleExportTypeChange("csv")}
                  loading={exporting}
                >
                  Export CSV
                </antd_1.Button>
                <antd_1.Button
                  type="primary"
                  icon={<icons_1.DownloadOutlined />}
                  onClick={() => handleExportTypeChange("pdf")}
                  loading={exporting}
                >
                  Export PDF
                </antd_1.Button>
              </antd_1.Space>
            </antd_1.Col>
          </antd_1.Row>
        </antd_1.Card>

        {/* Filters */}
        <antd_1.Card
          size="small"
          title={
            <antd_1.Space>
              <icons_1.FilterOutlined />
              Filters
              <antd_1.Tooltip title="Filter and sort your spending analytics">
                <icons_1.InfoCircleOutlined />
              </antd_1.Tooltip>
            </antd_1.Space>
          }
        >
          <antd_1.Space wrap>
            <Search
              placeholder="Search categories"
              style={{ width: 200 }}
              allowClear
              onChange={handleCategorySearch}
            />
            <antd_1.Input
              placeholder="Search merchants"
              style={{ width: 200 }}
              allowClear
              onChange={handleMerchantSearch}
            />
            <antd_1.Input
              placeholder="Min Amount"
              type="number"
              style={{ width: 120 }}
              onChange={handleAmountSearch}
            />
            <antd_1.Input
              placeholder="Max Amount"
              type="number"
              style={{ width: 120 }}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  maxAmount: e.target.value ? Number(e.target.value) : null,
                }))
              }
            />
          </antd_1.Space>
        </antd_1.Card>

        {/* Summary Statistics */}
        <antd_1.Row gutter={16}>
          <antd_1.Col span={6}>
            <antd_1.Card>
              <antd_1.Statistic
                title="Total Spent"
                value={data?.totalSpent || 0}
                precision={2}
                prefix="$"
                loading={analyticsLoading}
              />
            </antd_1.Card>
          </antd_1.Col>
          <antd_1.Col span={6}>
            <antd_1.Card>
              <antd_1.Statistic
                title="Average per Transaction"
                value={data?.averagePerTransaction || 0}
                precision={2}
                prefix="$"
                loading={analyticsLoading}
              />
            </antd_1.Card>
          </antd_1.Col>
          <antd_1.Col span={6}>
            <antd_1.Card>
              <antd_1.Statistic
                title="Spending Trend"
                value={data?.spendingTrend || "stable"}
                valueStyle={{
                  color:
                    data?.spendingTrend != null
                      ? "#cf1322"
                      : data?.spendingTrend != null
                        ? "#3f8600"
                        : "#666",
                }}
                loading={analyticsLoading}
              />
            </antd_1.Card>
          </antd_1.Col>
        </antd_1.Row>

        {/* Charts */}
        <antd_1.Row gutter={16}>
          <antd_1.Col span={12}>
            <antd_1.Card title="Spending Trend" extra={<icons_1.LineChartOutlined />}>
              <plots_1.Line
                data={spendingTrendData}
                xField="date"
                yField="amount"
                point={{
                  size: 5,
                  shape: "diamond",
                }}
                label={{
                  style: {
                    fill: "#aaa",
                  },
                }}
              />
            </antd_1.Card>
          </antd_1.Col>
          <antd_1.Col span={12}>
            <antd_1.Card title="Spending by Category" extra={<icons_1.PieChartOutlined />}>
              <plots_1.Pie
                data={categoryData}
                angleField="value"
                colorField="category"
                radius={0.8}
                label={{
                  type: "outer",
                  content: "{name} ({percentage})",
                }}
                interactions={[
                  {
                    type: "element-active",
                  },
                ]}
              />
            </antd_1.Card>
          </antd_1.Col>
        </antd_1.Row>

        {/* Detailed Table */}
        {data?.topCategories && (
          <antd_1.Card title="Top Spending Categories">
            <antd_1.Table
              dataSource={filteredCategories}
              rowKey="category"
              pagination={{
                ...tableParams.pagination,
                total: filteredCategories.length,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} categories`,
              }}
              onChange={handleTableChange}
              loading={analyticsLoading}
            >
              <antd_1.Table.Column
                title="Category"
                dataIndex="category"
                sorter={true}
                sortOrder={tableParams.sortField != null ? tableParams.sortOrder : null}
              />
              <antd_1.Table.Column
                title="Amount"
                dataIndex="amount"
                sorter={true}
                sortOrder={tableParams.sortField != null ? tableParams.sortOrder : null}
                render={renderAmount}
              />
              <antd_1.Table.Column
                title="% of Total"
                dataIndex="percentage"
                sorter={true}
                sortOrder={tableParams.sortField != null ? tableParams.sortOrder : null}
                render={formatPercentage}
              />
            </antd_1.Table>
          </antd_1.Card>
        )}
      </antd_1.Space>
    </div>
  );
};
exports.AnalyticsDashboard = AnalyticsDashboard;
//# sourceMappingURL=AnalyticsDashboard.js.map
