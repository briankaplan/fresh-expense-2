import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
          '@core': path.resolve(__dirname, '../src/core'),
          '@shared': path.resolve(__dirname, '../src/shared'),
          '@features': path.resolve(__dirname, '../src/features'),
          '@types': path.resolve(__dirname, '../../packages/types'),
          '@utils': path.resolve(__dirname, '../../packages/utils'),
          '@ui': path.resolve(__dirname, '../../packages/ui'),
        },
      },
    });
  },
};

export default config;
