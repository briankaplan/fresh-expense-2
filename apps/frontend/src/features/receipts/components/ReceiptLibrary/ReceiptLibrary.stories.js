"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Empty = exports.Loading = exports.Default = void 0;
const ReceiptLibrary_1 = require("./ReceiptLibrary");
const meta = {
    title: 'Features/Receipts/ReceiptLibrary',
    component: ReceiptLibrary_1.ReceiptLibrary,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
};
exports.default = meta;
const mockReceipts = [
    {
        id: '1',
        filename: 'receipt-1.pdf',
        status: 'matched',
        url: 'https://example.com/receipt-1.pdf',
        transactionId: 'txn-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '2',
        filename: 'receipt-2.pdf',
        status: 'matched',
        url: 'https://example.com/receipt-2.pdf',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '3',
        filename: 'receipt-3.pdf',
        status: 'matched',
        url: 'https://example.com/receipt-3.pdf',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '4',
        filename: 'receipt-4.pdf',
        status: 'matched',
        url: 'https://example.com/receipt-4.pdf',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];
exports.Default = {
    args: {
        company: 'Acme Corp',
    },
    parameters: {
        mockData: [
            {
                url: '/api/receipts?company=Acme Corp',
                method: 'GET',
                status: 200,
                response: mockReceipts,
            },
        ],
    },
};
exports.Loading = {
    args: {
        company: 'Acme Corp',
    },
    parameters: {
        mockData: [
            {
                url: '/api/receipts?company=Acme Corp',
                method: 'GET',
                status: 200,
                response: mockReceipts,
                delay: 2000,
            },
        ],
    },
};
exports.Empty = {
    args: {
        company: 'Acme Corp',
    },
    parameters: {
        mockData: [
            {
                url: '/api/receipts?company=Acme Corp',
                method: 'GET',
                status: 200,
                response: [],
            },
        ],
    },
};
//# sourceMappingURL=ReceiptLibrary.stories.js.map