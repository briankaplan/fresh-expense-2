"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionList = TransactionList;
const react_1 = require("react");
const material_1 = require("@mui/material");
const shared_1 = require("../shared");
const Notification_1 = require("../shared/Notification");
function TransactionList({ transactions, onTransactionClick }) {
    const { showNotification } = (0, Notification_1.useNotification)();
    const [selectedRows, setSelectedRows] = (0, react_1.useState)([]);
    const columns = [
        { id: 'date', label: 'Date', minWidth: 120 },
        { id: 'description', label: 'Description', minWidth: 200 },
        { id: 'amount', label: 'Amount', minWidth: 120, align: 'right' },
        { id: 'category', label: 'Category', minWidth: 150 },
        { id: 'merchant', label: 'Merchant', minWidth: 150 },
    ];
    const handleRowClick = (row) => {
        if (onTransactionClick) {
            onTransactionClick(row);
        }
    };
    return (<material_1.Box sx={{ height: 400, width: '100%' }}>
      <material_1.Typography variant="h6" gutterBottom>
        Transactions
      </material_1.Typography>
      <shared_1.DataTable columns={columns} data={transactions} onRowClick={handleRowClick} searchable defaultSortBy="date" defaultSortOrder="desc"/>
    </material_1.Box>);
}
//# sourceMappingURL=TransactionList.js.map