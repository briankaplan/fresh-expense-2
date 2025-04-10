import React, { useState, useCallback, useMemo } from 'react';
import { useSpendingAnalytics, useDataExport } from '@fresh-expense/hooks';
import { Card, Row, Col, Select, Button, Table, Statistic, Space, DatePicker, Input, Tooltip } from 'antd';
import { 
  DownloadOutlined, 
  LineChartOutlined, 
  PieChartOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';
import type { AggregationConfig } from '@fresh-expense/types';
import type { TableProps } from 'antd/es/table';
import type { Moment } from 'moment';
import type { SpendingData } from '../hooks/useSpendingAnalytics';
import type { ExportOptions } from '../hooks/useDataExport';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

interface AnalyticsFilters {
  categorySearch: string;
  minAmount: number | null;
  maxAmount: number | null;
  trend: 'all' | 'increasing' | 'decreasing' | 'stable';
}

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

interface FilterState {
  dateRange: [Moment, Moment] | null;
  category: string;
  merchant: string;
  minAmount: number | null;
  maxAmount: number | null;
}

interface Category {
  name: string;
  amount: number;
  percentage: number;
}

interface SpendingRecord {
  id: string;
  amount: number;
  date: string;
  category: string;
  merchant: string;
}

interface TopCategory {
  category: string;
  amount: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface SpendingAnalytics {
  totalSpending: number;
  topCategories: TopCategory[];
  recentTransactions: SpendingRecord[];
  spendingByCategory: {
    [key: string]: number;
  };
}

export const AnalyticsDashboard: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
    new Date()
  ]);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: null,
    category: '',
    merchant: '',
    minAmount: null,
    maxAmount: null,
  });
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10
    },
    sortField: 'amount',
    sortOrder: 'descend' as 'ascend' | 'descend' | null
  });
  
  const { data, loading: analyticsLoading } = useSpendingAnalytics(period);
  const { 
    exportData, 
    loading: exporting 
  } = useDataExport();

  const topCategories = data?.topCategories || [];
  const spendingByCategory = data?.spendingByCategory || {};

  // Filter and sort category data
  const filteredCategories = useMemo(() => {
    if (!data?.topCategories) return [];

    return data.topCategories
      .filter(category => {
        // Search filter
        if (filters.category && 
            !category.category.toLowerCase().includes(filters.category.toLowerCase())) {
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
        if (tableParams.sortField === 'amount') {
          return tableParams.sortOrder === 'ascend' 
            ? a.amount - b.amount 
            : b.amount - a.amount;
        }
        if (tableParams.sortField === 'category') {
          return tableParams.sortOrder === 'ascend'
            ? a.category.localeCompare(b.category)
            : b.category.localeCompare(a.category);
        }
        if (tableParams.sortField === 'percentage') {
          const aPerc = (a.amount / data.totalSpent) * 100;
          const bPerc = (b.amount / data.totalSpent) * 100;
          return tableParams.sortOrder === 'ascend'
            ? aPerc - bPerc
            : bPerc - aPerc;
        }
        return 0;
      });
  }, [data, filters, tableParams]);

  // Handle table change
  const handleTableChange: TableProps<any>['onChange'] = (
    pagination,
    filters,
    sorter: any
  ) => {
    setTableParams({
      pagination: {
        current: pagination.current || 1,
        pageSize: pagination.pageSize || 10
      },
      sortField: sorter.field || 'amount',
      sortOrder: sorter.order || 'descend'
    });
  };

  const handleExportTypeChange = (format: 'csv' | 'pdf' | 'xlsx'): void => {
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
  const spendingTrendData = data ? data.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    amount: item.totalSpent
  })) : [];

  const categoryData = data?.topCategories.map(cat => ({
    category: cat.category,
    value: cat.amount
  })) || [];

  const handleDateChange = (dates: [Moment, Moment] | null): void => {
    setFilters(prev => ({
      ...prev,
      dateRange: dates
    }));
  };

  const handleCategorySearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters(prev => ({
      ...prev,
      category: e.target.value
    }));
  };

  const handleMerchantSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters(prev => ({
      ...prev,
      merchant: e.target.value
    }));
  };

  const handleAmountSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters(prev => ({
      ...prev,
      minAmount: e.target.value ? parseFloat(e.target.value) : null
    }));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const renderAmount = (_: unknown, record: SpendingRecord): string => {
    return formatCurrency(record.amount);
  };

  const renderCategoryRow = (category: TopCategory): JSX.Element => {
    return (
      <Table.Row key={category.category}>
        <Table.Cell>{category.category}</Table.Cell>
        <Table.Cell>{formatCurrency(category.amount)}</Table.Cell>
        <Table.Cell>{formatPercentage(category.percentage)}</Table.Cell>
        <Table.Cell>{category.trend}</Table.Cell>
      </Table.Row>
    );
  };

  return (
    <div className="analytics-dashboard">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Controls */}
        <Card>
          <Row gutter={[16, 16]}>
            <Col>
              <Select 
                value={period} 
                onChange={setPeriod}
                style={{ width: 120 }}
              >
                <Option value="day">Daily</Option>
                <Option value="week">Weekly</Option>
                <Option value="month">Monthly</Option>
                <Option value="year">Yearly</Option>
              </Select>
            </Col>
            <Col>
              <RangePicker 
                value={[dateRange[0], dateRange[1]]} 
                onChange={handleDateChange}
              />
            </Col>
            <Col>
              <Space>
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={() => handleExportTypeChange('csv')}
                  loading={exporting}
                >
                  Export CSV
                </Button>
                <Button 
                  type="primary"
                  icon={<DownloadOutlined />} 
                  onClick={() => handleExportTypeChange('pdf')}
                  loading={exporting}
                >
                  Export PDF
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Filters */}
        <Card 
          size="small" 
          title={
            <Space>
              <FilterOutlined />
              Filters
              <Tooltip title="Filter and sort your spending analytics">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
        >
          <Space wrap>
            <Search
              placeholder="Search categories"
              style={{ width: 200 }}
              allowClear
              onChange={handleCategorySearch}
            />
            <Input
              placeholder="Search merchants"
              style={{ width: 200 }}
              allowClear
              onChange={handleMerchantSearch}
            />
            <Input
              placeholder="Min Amount"
              type="number"
              style={{ width: 120 }}
              onChange={handleAmountSearch}
            />
            <Input
              placeholder="Max Amount"
              type="number"
              style={{ width: 120 }}
              onChange={e => setFilters(prev => ({ 
                ...prev, 
                maxAmount: e.target.value ? Number(e.target.value) : null 
              }))}
            />
          </Space>
        </Card>

        {/* Summary Statistics */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Spent"
                value={data?.totalSpent || 0}
                precision={2}
                prefix="$"
                loading={analyticsLoading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Average per Transaction"
                value={data?.averagePerTransaction || 0}
                precision={2}
                prefix="$"
                loading={analyticsLoading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Spending Trend"
                value={data?.spendingTrend || 'stable'}
                valueStyle={{ 
                  color: data?.spendingTrend === 'increasing' ? '#cf1322' : 
                         data?.spendingTrend === 'decreasing' ? '#3f8600' : 
                         '#666'
                }}
                loading={analyticsLoading}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row gutter={16}>
          <Col span={12}>
            <Card 
              title="Spending Trend" 
              extra={<LineChartOutlined />}
            >
              <Line
                data={spendingTrendData}
                xField="date"
                yField="amount"
                point={{
                  size: 5,
                  shape: 'diamond',
                }}
                label={{
                  style: {
                    fill: '#aaa',
                  },
                }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card 
              title="Spending by Category" 
              extra={<PieChartOutlined />}
            >
              <Pie
                data={categoryData}
                angleField="value"
                colorField="category"
                radius={0.8}
                label={{
                  type: 'outer',
                  content: '{name} ({percentage})',
                }}
                interactions={[
                  {
                    type: 'element-active',
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>

        {/* Detailed Table */}
        {data?.topCategories && (
          <Card title="Top Spending Categories">
            <Table
              dataSource={filteredCategories}
              rowKey="category"
              pagination={{
                ...tableParams.pagination,
                total: filteredCategories.length,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} categories`
              }}
              onChange={handleTableChange}
              loading={analyticsLoading}
            >
              <Table.Column 
                title="Category" 
                dataIndex="category"
                sorter={true}
                sortOrder={tableParams.sortField === 'category' ? tableParams.sortOrder : null}
              />
              <Table.Column 
                title="Amount" 
                dataIndex="amount"
                sorter={true}
                sortOrder={tableParams.sortField === 'amount' ? tableParams.sortOrder : null}
                render={renderAmount}
              />
              <Table.Column 
                title="% of Total" 
                dataIndex="percentage"
                sorter={true}
                sortOrder={tableParams.sortField === 'percentage' ? tableParams.sortOrder : null}
                render={formatPercentage}
              />
            </Table>
          </Card>
        )}
      </Space>
    </div>
  );
}; 