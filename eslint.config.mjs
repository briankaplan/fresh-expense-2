import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    ignores: ['node_modules/', 'dist/', 'build/'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        project: ['./tsconfig.json', './apps/*/tsconfig.json', './packages/*/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        browser: true,
        node: true,
        es2022: true,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'import': importPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      '@typescript-eslint/explicit-function-return-type': ['error', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      }],
      '@typescript-eslint/explicit-member-accessibility': ['error', {
        accessibility: 'explicit',
        overrides: {
          constructors: 'no-public',
        },
      }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'import/extensions': ['error', 'ignorePackages', {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      }],
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'error',
      ...prettierConfig.rules,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json', './apps/*/tsconfig.json', './packages/*/tsconfig.json'],
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
]; 