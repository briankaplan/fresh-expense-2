import type { Meta, StoryObj } from '@storybook/react';
import { TransactionList } from './TransactionList';

const meta: Meta<typeof TransactionList> = {
  title: 'Features/Expenses/TransactionList',
  component: TransactionList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TransactionList>;

const sampleTransactions = [
  {
    id: '1',
    date: new Date("2024-03-15"),
    description: 'Grocery shopping',
    amount: { value: 150.75, currency: "USD" },
    category: 'Groceries',
    merchant: { name: 'Whole Foods' },
  },
  {
    id: '2',
    date: new Date("2024-03-14"),
    description: 'Dinner with friends',
    amount: { value: 85.5, currency: "USD" },
    category: 'Dining',
    merchant: { name: 'Italian Restaurant' },
  },
  {
    id: '3',
    date: new Date("2024-03-13"),
    description: 'Gas station',
    amount: { value: 45.0, currency: "USD" },
    category: 'Transportation',
    merchant: { name: 'Shell' },
  },
];

export const Default: Story = {
  args: {
    transactions: sampleTransactions,
  },
};

export const Loading: Story = {
  args: {
    transactions: sampleTransactions,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    transactions: [],
  },
};

export const WithClickHandler: Story = {
  args: {
    transactions: sampleTransactions,
    onTransactionClick: transaction => {
      console.log('Clicked transaction:', transaction);
    },
  },
};
