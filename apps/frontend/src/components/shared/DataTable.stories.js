"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Empty = exports.Loading = exports.WithSorting = exports.WithSearch = exports.Default = void 0;
const DataTable_1 = require("./DataTable");
const meta = {
    title: 'Components/DataTable',
    component: DataTable_1.DataTable,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        onRowClick: { action: 'row clicked' },
    },
};
exports.default = meta;
const sampleData = [
    { id: 1, name: 'John Doe', age: 30, email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com' },
];
const columns = [
    { id: 'name', label: 'Name', minWidth: 150 },
    { id: 'age', label: 'Age', minWidth: 100, align: 'right' },
    { id: 'email', label: 'Email', minWidth: 200 },
];
exports.Default = {
    args: {
        columns,
        data: sampleData,
    },
};
exports.WithSearch = {
    args: {
        columns,
        data: sampleData,
        searchable: true,
    },
};
exports.WithSorting = {
    args: {
        columns,
        data: sampleData,
        defaultSortBy: 'age',
        defaultSortOrder: 'desc',
    },
};
exports.Loading = {
    args: {
        columns,
        data: [],
        loading: true,
    },
};
exports.Empty = {
    args: {
        columns,
        data: [],
    },
};
//# sourceMappingURL=DataTable.stories.js.map