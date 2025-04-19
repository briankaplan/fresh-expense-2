import type { Receipt, Transaction } from "@fresh-expense/types";
import type { Meta, StoryObj } from "@storybook/react";
import { ReceiptMatcher } from "./ReceiptMatcher";

const meta: Meta<typeof ReceiptMatcher> = {
  title: "Features/Receipts/ReceiptMatcher",
  component: ReceiptMatcher,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ReceiptMatcher>;

const mockReceipts: Receipt[] = [
  {
    id: "1",
    filename: "receipt1.pdf",
    url: "https://example.com/receipt1.pdf",
    status: "matched",
    metadata: {
      amount: { value: 100.5, currency: "USD" },
      date: new Date("2024-03-15T12:00:00Z"),
      merchant: { name: "Acme Store" },
    },
    createdAt: new Date("2024-03-15T12:00:00Z"),
    updatedAt: new Date("2024-03-15T12:00:00Z"),
  },
  {
    id: "2",
    filename: "receipt2.pdf",
    url: "https://example.com/receipt2.pdf",
    status: "matched",
    metadata: {
      amount: { value: 75.25, currency: "USD" },
      date: new Date("2024-03-14T15:30:00Z"),
      merchant: { name: "Best Buy" },
    },
    createdAt: new Date("2024-03-14T15:30:00Z"),
    updatedAt: new Date("2024-03-14T15:30:00Z"),
  },
];

const mockTransactions: Transaction[] = [
  {
    id: "1",
    merchant: { name: "Acme Store" },
    amount: { value: 100.5, currency: "USD" },
    date: new Date("2024-03-15T11:45:00Z"),
    category: "Shopping",
    status: "pending",
    createdAt: new Date("2024-03-15T11:45:00Z"),
    updatedAt: new Date("2024-03-15T11:45:00Z"),
  },
  {
    id: "2",
    merchant: { name: "Best Buy Electronics" },
    amount: { value: 75.25, currency: "USD" },
    date: new Date("2024-03-14T16:00:00Z"),
    category: "Electronics",
    status: "pending",
    createdAt: new Date("2024-03-14T16:00:00Z"),
    updatedAt: new Date("2024-03-14T16:00:00Z"),
  },
];

export const Default: Story = {
  args: {
    company: "Acme Corp",
  },
  parameters: {
    mockData: [
      {
        url: "/api/receipts?status=unmatched",
        method: "GET",
        status: 200,
        response: mockReceipts,
      },
      {
        url: "/api/transactions",
        method: "GET",
        status: 200,
        response: mockTransactions,
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
        url: "/api/receipts?status=unmatched",
        method: "GET",
        status: 200,
        response: mockReceipts,
        delay: 2000,
      },
      {
        url: "/api/transactions",
        method: "GET",
        status: 200,
        response: mockTransactions,
        delay: 2000,
      },
    ],
  },
};

export const NoMatches: Story = {
  args: {
    company: "Acme Corp",
  },
  parameters: {
    mockData: [
      {
        url: "/api/receipts?status=unmatched",
        method: "GET",
        status: 200,
        response: [],
      },
      {
        url: "/api/transactions",
        method: "GET",
        status: 200,
        response: [],
      },
    ],
  },
};
