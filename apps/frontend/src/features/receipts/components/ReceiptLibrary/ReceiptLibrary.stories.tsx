import type { Receipt } from "@fresh-expense/types";
import type { Meta, StoryObj } from "@storybook/react";
import { ReceiptLibrary } from "./ReceiptLibrary";

const meta: Meta<typeof ReceiptLibrary> = {
  title: "Features/Receipts/ReceiptLibrary",
  component: ReceiptLibrary,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ReceiptLibrary>;

const mockReceipts: Receipt[] = [
  {
    id: "1",
    filename: "receipt-1.pdf",
    status: "matched",
    url: "https://example.com/receipt-1.pdf",
    transactionId: "txn-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    filename: "receipt-2.pdf",
    status: "matched",
    url: "https://example.com/receipt-2.pdf",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    filename: "receipt-3.pdf",
    status: "matched",
    url: "https://example.com/receipt-3.pdf",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    filename: "receipt-4.pdf",
    status: "matched",
    url: "https://example.com/receipt-4.pdf",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const Default: Story = {
  args: {
    company: "Acme Corp",
  },
  parameters: {
    mockData: [
      {
        url: "/api/receipts?company=Acme Corp",
        method: "GET",
        status: 200,
        response: mockReceipts,
      },
    ],
  },
};

export const Loading: Story = {
  args: {
    company: "Acme Corp",
  },
  parameters: {
    mockData: [
      {
        url: "/api/receipts?company=Acme Corp",
        method: "GET",
        status: 200,
        response: mockReceipts,
        delay: 2000,
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    company: "Acme Corp",
  },
  parameters: {
    mockData: [
      {
        url: "/api/receipts?company=Acme Corp",
        method: "GET",
        status: 200,
        response: [],
      },
    ],
  },
};
