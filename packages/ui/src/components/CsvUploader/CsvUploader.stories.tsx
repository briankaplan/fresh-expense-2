import { Meta, StoryObj } from '@storybook/react';
import { CsvUploader } from './CsvUploader';

const meta: Meta<typeof CsvUploader> = {
  title: 'Components/CsvUploader',
  component: CsvUploader,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CsvUploader>;

export const Basic: Story = {
  args: {
    onUpload: async file => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('File uploaded:', file.name);
    },
  },
};

export const CustomAcceptedTypes: Story = {
  args: {
    onUpload: async file => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('File uploaded:', file.name);
    },
    accept: ['.csv', '.xlsx', '.xls'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
};

export const WithError: Story = {
  args: {
    onUpload: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      throw new Error('Failed to upload file: Network error');
    },
  },
};

export const MultipleFiles: Story = {
  args: {
    onUpload: async file => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('File uploaded:', file.name);
    },
    multiple: true,
  },
};
