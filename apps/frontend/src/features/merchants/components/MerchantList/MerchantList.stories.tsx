import type { Meta, StoryObj } from '@storybook/react';
import { MerchantList } from './MerchantList';

const meta: Meta<typeof MerchantList> = {
  title: 'Features/Merchants/MerchantList',
  component: MerchantList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MerchantList>;

const sampleMerchants = [
  {
    id: '1',
    name: 'Whole Foods',
    category: 'Groceries',
    totalSpent: 1500.75,
    transactionCount: 12,
    lastTransactionDate: '2024-03-15',
  },
  {
    id: '2',
    name: 'Italian Restaurant',
    category: 'Dining',
    totalSpent: 850.5,
    transactionCount: 8,
    lastTransactionDate: '2024-03-14',
  },
  {
    id: '3',
    name: 'Shell',
    category: 'Transportation',
    totalSpent: 450.0,
    transactionCount: 15,
    lastTransactionDate: '2024-03-13',
  },
];

export const Default: Story = {
  args: {
    merchants: sampleMerchants,
  },
};

export const Loading: Story = {
  args: {
    merchants: sampleMerchants,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    merchants: [],
  },
};

export const WithClickHandler: Story = {
  args: {
    merchants: sampleMerchants,
    onMerchantClick: merchant => {
      console.log('Clicked merchant:', merchant);
    },
  },
};
