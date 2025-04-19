Object.defineProperty(exports, "__esModule", { value: true });
exports.Unlinked = exports.Linked = void 0;
const ReceiptDetails_1 = require("./ReceiptDetails");
const react_toastify_1 = require("react-toastify");
const meta = {
  title: "Features/Receipts/ReceiptDetails",
  component: ReceiptDetails_1.ReceiptDetails,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};
exports.default = meta;
const mockReceipt = {
  id: "1",
  transactionId: "123",
  url: "https://example.com/receipt.jpg",
  createdAt: new Date("2024-03-20T10:00:00Z"),
  updatedAt: new Date("2024-03-20T10:00:00Z"),
};
const mockUnlinkedReceipt = {
  ...mockReceipt,
  transactionId: null,
};
exports.Linked = {
  args: {
    receipt: mockReceipt,
    onUpdate: (receipt) => {
      console.log("Receipt updated:", receipt);
      react_toastify_1.toast.success("Receipt updated successfully");
    },
    onDelete: (receiptId) => {
      console.log("Receipt deleted:", receiptId);
      react_toastify_1.toast.success("Receipt deleted successfully");
    },
  },
};
exports.Unlinked = {
  args: {
    receipt: mockUnlinkedReceipt,
    onUpdate: (receipt) => {
      console.log("Receipt updated:", receipt);
      react_toastify_1.toast.success("Receipt updated successfully");
    },
    onDelete: (receiptId) => {
      console.log("Receipt deleted:", receiptId);
      react_toastify_1.toast.success("Receipt deleted successfully");
    },
  },
};
//# sourceMappingURL=ReceiptDetails.stories.js.map
