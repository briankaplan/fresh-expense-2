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
const hooks_1 = require("@fresh-expense/hooks");
const antd_1 = require("antd");
const icons_1 = require("@ant-design/icons");
require("./ReceiptManager.css");
const { Column } = antd_1.Table;
const ReceiptManager = () => {
    const [searchText, setSearchText] = (0, react_1.useState)('');
    const [tableParams, setTableParams] = (0, react_1.useState)({
        pagination: {
            current: 1,
            pageSize: 10,
            total: 0,
        },
        sortField: null,
        sortOrder: null,
        filters: {},
    });
    const { uploading } = (0, hooks_1.useReceiptUpload)();
    const { processing } = (0, hooks_1.useReceiptOCR)();
    const { normalizing } = (0, hooks_1.useReceiptNormalization)();
    const [processedReceipts] = (0, react_1.useState)([]);
    const handleTableChange = (pagination, filters, sorter) => {
        const { field, order } = sorter;
        setTableParams({
            pagination: pagination || {
                current: 1,
                pageSize: 10,
                total: 0,
            },
            sortField: field,
            sortOrder: order,
            filters,
        });
    };
    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };
    const handleDateChange = (dates) => {
        const filters = { ...tableParams.filters };
        if (dates) {
            filters.dates = dates;
        }
        else {
            delete filters.dates;
        }
        setTableParams({
            ...tableParams,
            filters,
            pagination: { ...tableParams.pagination, current: 1 },
        });
    };
    const handleStatusChange = (value) => {
        const filters = { ...tableParams.filters };
        if (value) {
            filters.status = [value];
        }
        else {
            delete filters.status;
        }
        setTableParams({
            ...tableParams,
            filters,
            pagination: { ...tableParams.pagination, current: 1 },
        });
    };
    const formatTotal = (total) => {
        if (!total)
            return '-';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(total);
    };
    const sortByDate = (a, b) => {
        const dateA = new Date(a.uploadDate);
        const dateB = new Date(b.uploadDate);
        return dateB.getTime() - dateA.getTime();
    };
    const sortByAmount = (a, b) => {
        return (b.total || 0) - (a.total || 0);
    };
    const sortByItems = (a, b) => {
        return (b.items?.length || 0) - (a.items?.length || 0);
    };
    const sortByConfidence = (a, b) => {
        return (b.confidence || 0) - (a.confidence || 0);
    };
    const sortByStatus = (a, b) => {
        const statusOrder = {
            completed: 0,
            processing: 1,
            pending: 2,
            failed: 3,
        };
        return statusOrder[a.status] - statusOrder[b.status];
    };
    return (<antd_1.Card>
      <antd_1.Space direction="vertical" style={{ width: '100%' }}>
        <div className="receipt-manager-filters">
          <antd_1.Space>
            <antd_1.Input placeholder="Search receipts..." prefix={<icons_1.SearchOutlined />} value={searchText} onChange={handleSearch} className="receipt-manager-search" allowClear/>
            <antd_1.DatePicker.RangePicker onChange={handleDateChange}/>
            <antd_1.Select placeholder="Status" className="receipt-manager-status-select" onChange={handleStatusChange} allowClear>
              <antd_1.Select.Option value="pending">Pending</antd_1.Select.Option>
              <antd_1.Select.Option value="processing">Processing</antd_1.Select.Option>
              <antd_1.Select.Option value="completed">Completed</antd_1.Select.Option>
              <antd_1.Select.Option value="failed">Failed</antd_1.Select.Option>
            </antd_1.Select>
          </antd_1.Space>
        </div>

        <antd_1.Table dataSource={processedReceipts} onChange={handleTableChange} pagination={tableParams.pagination} loading={uploading || processing || normalizing}>
          <Column title="Date" dataIndex="uploadDate" key="uploadDate" sorter={sortByDate}/>
          <Column title="Merchant" dataIndex="merchantName" key="merchantName"/>
          <Column title="Total" dataIndex="total" key="total" render={(total) => formatTotal(total)} sorter={sortByAmount}/>
          <Column title="Items" dataIndex="items" key="items" render={(items) => items?.length || 0} sorter={sortByItems}/>
          <Column title="Confidence" dataIndex="confidence" key="confidence" render={(confidence) => confidence ? `${Math.round(confidence * 100)}%` : '-'} sorter={sortByConfidence}/>
          <Column title="Status" dataIndex="status" key="status" render={(status) => (<antd_1.Tag color={status === 'completed'
                ? 'success'
                : status === 'processing'
                    ? 'processing'
                    : status === 'pending'
                        ? 'default'
                        : 'error'}>
                {status.toUpperCase()}
              </antd_1.Tag>)} sorter={sortByStatus}/>
        </antd_1.Table>
      </antd_1.Space>
    </antd_1.Card>);
};
exports.default = ReceiptManager;
//# sourceMappingURL=ReceiptManager.js.map