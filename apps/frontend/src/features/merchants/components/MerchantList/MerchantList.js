"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantList = MerchantList;
const react_1 = __importDefault(require("react"));
const ui_1 = require("@fresh-expense/ui");
const utils_1 = require("@fresh-expense/utils");
function MerchantList({ merchants, loading = false, onMerchantClick }) {
    const columns = [
        {
            id: 'name',
            label: 'Merchant',
            minWidth: 200,
            sortable: true,
        },
        {
            id: 'category',
            label: 'Category',
            minWidth: 150,
            sortable: true,
        },
        {
            id: 'totalSpent',
            label: 'Total Spent',
            minWidth: 150,
            align: 'right',
            format: (value) => (0, utils_1.formatCurrency)(value),
            sortable: true,
        },
        {
            id: 'transactionCount',
            label: 'Transactions',
            minWidth: 100,
            align: 'right',
            sortable: true,
        },
        {
            id: 'lastTransactionDate',
            label: 'Last Transaction',
            minWidth: 150,
            sortable: true,
        },
    ];
    return (<ui_1.DataTable data={merchants} columns={columns} loading={loading} searchable sortable onRowClick={onMerchantClick}/>);
}
//# sourceMappingURL=MerchantList.js.map