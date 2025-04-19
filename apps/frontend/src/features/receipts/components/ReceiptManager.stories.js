"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loading = exports.WithReceipt = exports.Default = void 0;
const ReceiptManager_1 = require("./ReceiptManager");
const meta = {
    title: 'Features/Receipts/ReceiptManager',
    component: ReceiptManager_1.ReceiptManager,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};
exports.default = meta;
const mockReceipt = {
    id: '1',
    transactionId: '1',
    url: 'https://example.com/receipt.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};
exports.Default = {
    args: {
        transactionId: '1',
    },
};
exports.WithReceipt = {
    args: {
        transactionId: '1',
    },
    render: args => (<ReceiptManager_1.ReceiptManager {...args} onReceiptChange={receipt => console.log('Receipt changed:', receipt)}/>),
};
exports.Loading = {
    args: {
        transactionId: '1',
    },
    render: args => (<ReceiptManager_1.ReceiptManager {...args} onReceiptChange={receipt => console.log('Receipt changed:', receipt)}/>),
    parameters: {
        mockData: [
            {
                url: '/api/receipts/1',
                method: 'GET',
                status: 200,
                response: mockReceipt,
                delay: 2000,
            },
        ],
    },
};
//# sourceMappingURL=ReceiptManager.stories.js.map