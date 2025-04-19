import type { Meta, StoryObj } from "@storybook/react";
import { DataTable } from "./DataTable";

interface SampleData extends Record<string, any> {
  id: number;
  name: string;
  age: number;
  city: string;
}

const meta: Meta<typeof DataTable> = {
  title: "Components/DataTable",
  component: DataTable,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTable>;

const sampleData: SampleData[] = [
  { id: 1, name: "John Doe", age: 30, city: "New York" },
  { id: 2, name: "Jane Smith", age: 25, city: "Los Angeles" },
  { id: 3, name: "Bob Johnson", age: 35, city: "Chicago" },
  { id: 4, name: "Alice Brown", age: 28, city: "Houston" },
  { id: 5, name: "Charlie Wilson", age: 32, city: "Phoenix" },
];

const columns = [
  { id: "id", label: "ID", minWidth: 50 },
  { id: "name", label: "Name", minWidth: 100 },
  { id: "age", label: "Age", minWidth: 50 },
  { id: "city", label: "City", minWidth: 100 },
];

export const Basic: Story = {
  args: {
    data: sampleData,
    columns,
  },
};

export const Searchable: Story = {
  args: {
    data: sampleData,
    columns,
    searchable: true,
  },
};

export const Sortable: Story = {
  args: {
    data: sampleData,
    columns,
    sortable: true,
  },
};

export const Interactive: Story = {
  args: {
    data: sampleData,
    columns,
    searchable: true,
    sortable: true,
    onRowClick: (row) => alert(`Clicked row with ID: ${row.id}`),
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns,
    searchable: true,
    sortable: true,
  },
};
