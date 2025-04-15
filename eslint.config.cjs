const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.next/**',
      '**/*.d.ts',
      '**/report/**',
      '**/pnpm-lock.yaml',
      '**/package-lock.json',
    ],
  },
  js.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
    },
  },
  prettier,
];
