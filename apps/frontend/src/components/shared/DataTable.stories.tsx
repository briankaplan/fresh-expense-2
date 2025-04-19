import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
  component: DataTable,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onRowClick: { action: 'row clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

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

export const Default: Story = {
  args: {
    columns,
    data: sampleData,
  },
};

export const WithSearch: Story = {
  args: {
    columns,
    data: sampleData,
    searchable: true,
  },
};

export const WithSorting: Story = {
  args: {
    columns,
    data: sampleData,
    defaultSortBy: 'age',
    defaultSortOrder: 'desc',
  },
};

export const Loading: Story = {
  args: {
    columns,
    data: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
  },
};
