import type { Receipt } from "@fresh-expense/types";
import type { Meta, StoryObj } from "@storybook/react";
import { ReceiptManager } from "./ReceiptManager";

const meta: Meta<typeof ReceiptManager> = {
  title: "Features/Receipts/ReceiptManager",
  component: ReceiptManager,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ReceiptManager>;

const mockReceipt: Receipt = {
  id: "1",
  transactionId: "1",
  url: "https://example.com/receipt.jpg",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const Default: Story = {
  args: {
    transactionId: "1",
  },
};

export const WithReceipt: Story = {
  args: {
    transactionId: "1",
  },
  render: (args) => (
    <ReceiptManager
      {...args}
      onReceiptChange={(receipt) => console.log("Receipt changed:", receipt)}
    />
  ),
};

export const Loading: Story = {
  args: {
    transactionId: "1",
  },
  render: (args) => (
    <ReceiptManager
      {...args}
      onReceiptChange={(receipt) => console.log("Receipt changed:", receipt)}
    />
  ),
  parameters: {
    mockData: [
      {
        url: "/api/receipts/1",
        method: "GET",
        status: 200,
        response: mockReceipt,
        delay: 2000,
      },
    ],
  },
};
