/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'This dependency is part of a circular relationship. You might want to revise ' +
        'your solution',
      from: {},
      to: {
        circular: true
      }
    },
    {
      name: 'no-orphans',
      comment:
        'This is an orphan module - it has no incoming or outgoing dependencies',
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: [
          '(^|/).[^/]+\\.(spec|test|stories)\\.(js|mjs|cjs|ts|tsx|jsx)$',
          '^src/types/',
          '^src/vite-env.d.ts'
        ]
      },
      to: {}
    },
    {
      name: 'no-feature-to-feature',
      comment: 'Features should not depend on other features',
      severity: 'error',
      from: {
        path: '^src/features/[^/]+/'
      },
      to: {
        path: '^src/features/[^/]+/'
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsConfig: {
      fileName: 'tsconfig.json'
    }
  }
}; 