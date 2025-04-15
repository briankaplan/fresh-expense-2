import React, { useState } from 'react';
import { useReceiptUpload, useReceiptOCR, useReceiptNormalization } from '@fresh-expense/hooks';
import { Card, Table, Tag, Space, Input, Select, DatePicker } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { TableProps, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import type { Moment } from 'moment';
import './ReceiptManager.css';

interface Receipt {
  id: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  uploadDate: string;
  merchantName?: string;
  total?: number;
  items?: Array<{
    description: string;
    amount: number;
  }>;
  confidence?: number;
}

interface TableParams {
  pagination: TablePaginationConfig;
  sortField: string | null;
  sortOrder: string | null;
  filters: {
    dates?: [Moment, Moment];
    status?: string[];
    [key: string]: any;
  };
}

const { Column } = Table;

const ReceiptManager: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    sortField: null,
    sortOrder: null,
    filters: {},
  });

  const { uploading } = useReceiptUpload();
  const { processing } = useReceiptOCR();
  const { normalizing } = useReceiptNormalization();

  const [processedReceipts] = useState<Receipt[]>([]);

  const handleTableChange: TableProps<Receipt>['onChange'] = (pagination, filters, sorter) => {
    const { field, order } = sorter as SorterResult<Receipt>;
    setTableParams({
      pagination: pagination || {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      sortField: field as string,
      sortOrder: order as string,
      filters,
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleDateChange = (dates: [Moment, Moment] | null) => {
    const filters = { ...tableParams.filters };
    if (dates) {
      filters.dates = dates;
    } else {
      delete filters.dates;
    }
    setTableParams({
      ...tableParams,
      filters,
      pagination: { ...tableParams.pagination, current: 1 },
    });
  };

  const handleStatusChange = (value: string | null) => {
    const filters = { ...tableParams.filters };
    if (value) {
      filters.status = [value];
    } else {
      delete filters.status;
    }
    setTableParams({
      ...tableParams,
      filters,
      pagination: { ...tableParams.pagination, current: 1 },
    });
  };

  const formatTotal = (total: number | undefined): string => {
    if (!total) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(total);
  };

  const sortByDate = (a: Receipt, b: Receipt) => {
    const dateA = new Date(a.uploadDate);
    const dateB = new Date(b.uploadDate);
    return dateB.getTime() - dateA.getTime();
  };

  const sortByAmount = (a: Receipt, b: Receipt) => {
    return (b.total || 0) - (a.total || 0);
  };

  const sortByItems = (a: Receipt, b: Receipt) => {
    return (b.items?.length || 0) - (a.items?.length || 0);
  };

  const sortByConfidence = (a: Receipt, b: Receipt) => {
    return (b.confidence || 0) - (a.confidence || 0);
  };

  const sortByStatus = (a: Receipt, b: Receipt) => {
    const statusOrder = {
      completed: 0,
      processing: 1,
      pending: 2,
      failed: 3,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="receipt-manager-filters">
          <Space>
            <Input
              placeholder="Search receipts..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={handleSearch}
              className="receipt-manager-search"
              allowClear
            />
            <DatePicker.RangePicker onChange={handleDateChange} />
            <Select
              placeholder="Status"
              className="receipt-manager-status-select"
              onChange={handleStatusChange}
              allowClear
            >
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="processing">Processing</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="failed">Failed</Select.Option>
            </Select>
          </Space>
        </div>

        <Table<Receipt>
          dataSource={processedReceipts}
          onChange={handleTableChange}
          pagination={tableParams.pagination}
          loading={uploading || processing || normalizing}
        >
          <Column title="Date" dataIndex="uploadDate" key="uploadDate" sorter={sortByDate} />
          <Column title="Merchant" dataIndex="merchantName" key="merchantName" />
          <Column
            title="Total"
            dataIndex="total"
            key="total"
            render={(total: number | undefined) => formatTotal(total)}
            sorter={sortByAmount}
          />
          <Column
            title="Items"
            dataIndex="items"
            key="items"
            render={(items: Receipt['items']) => items?.length || 0}
            sorter={sortByItems}
          />
          <Column
            title="Confidence"
            dataIndex="confidence"
            key="confidence"
            render={(confidence: number | undefined) =>
              confidence ? `${Math.round(confidence * 100)}%` : '-'
            }
            sorter={sortByConfidence}
          />
          <Column
            title="Status"
            dataIndex="status"
            key="status"
            render={(status: Receipt['status']) => (
              <Tag
                color={
                  status === 'completed'
                    ? 'success'
                    : status === 'processing'
                      ? 'processing'
                      : status === 'pending'
                        ? 'default'
                        : 'error'
                }
              >
                {status.toUpperCase()}
              </Tag>
            )}
            sorter={sortByStatus}
          />
        </Table>
      </Space>
    </Card>
  );
};

export default ReceiptManager;
