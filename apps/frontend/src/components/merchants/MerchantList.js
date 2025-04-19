"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantList = MerchantList;
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const shared_1 = require("../shared");
const Notification_1 = require("../shared/Notification");
function MerchantList({ merchants, onAddMerchant, onEditMerchant }) {
    const { showNotification } = (0, Notification_1.useNotification)();
    const [selectedRows, setSelectedRows] = (0, react_1.useState)([]);
    const columns = [
        { id: 'name', label: 'Name', minWidth: 200 },
        { id: 'category', label: 'Category', minWidth: 150 },
        { id: 'transactionCount', label: 'Transactions', minWidth: 120, align: 'right' },
        { id: 'lastTransactionDate', label: 'Last Transaction', minWidth: 150 },
    ];
    const handleRowClick = (row) => {
        if (onEditMerchant) {
            onEditMerchant(row);
        }
    };
    return (<material_1.Box sx={{ width: '100%' }}>
      <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <material_1.Typography variant="h6">Merchants</material_1.Typography>
        {onAddMerchant && (<material_1.Button variant="contained" startIcon={<icons_material_1.Add />} onClick={onAddMerchant}>
            Add Merchant
          </material_1.Button>)}
      </material_1.Box>
      <shared_1.DataTable columns={columns} data={merchants} onRowClick={handleRowClick} searchable defaultSortBy="name"/>
    </material_1.Box>);
}
//# sourceMappingURL=MerchantList.js.map