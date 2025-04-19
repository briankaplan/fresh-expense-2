import type { Meta, StoryObj } from "@storybook/react";
import { toast } from "react-toastify";
import { ReceiptDetails } from "./ReceiptDetails";

const meta: Meta<typeof ReceiptDetails> = {
  title: "Features/Receipts/ReceiptDetails",
  component: ReceiptDetails,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ReceiptDetails>;

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

export const Linked: Story = {
  args: {
    receipt: mockReceipt,
    onUpdate: (receipt) => {
      console.log("Receipt updated:", receipt);
      toast.success("Receipt updated successfully");
    },
    onDelete: (receiptId) => {
      console.log("Receipt deleted:", receiptId);
      toast.success("Receipt deleted successfully");
    },
  },
};

export const Unlinked: Story = {
  args: {
    receipt: mockUnlinkedReceipt,
    onUpdate: (receipt) => {
      console.log("Receipt updated:", receipt);
      toast.success("Receipt updated successfully");
    },
    onDelete: (receiptId) => {
      console.log("Receipt deleted:", receiptId);
      toast.success("Receipt deleted successfully");
    },
  },
};
