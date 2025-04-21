const baseConfig = require("../../.eslintrc.cjs");

module.exports = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    "@nx/dependency-checks": [
      "error",
      {
        buildTargets: ["build"],
        ignoredFiles: [
          "{projectRoot}/.eslintrc.{js,cjs}",
          "{projectRoot}/vite.config.{js,ts,mjs,mts}",
          "{projectRoot}/vitest.config.{js,ts,mjs,mts}",
        ],
      },
    ],
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ],
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "import/no-unresolved": ["error", { "ignore": ["^@fresh-expense/"] }],
    "import/extensions": ["error", "never", { "json": "always" }]
  },
  overrides: [
    ...baseConfig.overrides,
    {
      files: ["*.json", "*.jsonc"],
      parser: "jsonc-eslint-parser",
      parserOptions: {
        ecmaVersion: 2020,
      },
    },
    {
      files: ["*.config.{js,ts,mjs,mts}"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  ],
};
