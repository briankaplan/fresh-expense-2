const baseConfig = require("../../.eslintrc.cjs");

module.exports = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    "@nx/dependency-checks": [
      "error",
      {
        ignoredFiles: [
          "{projectRoot}/.eslintrc.{js,cjs}",
          "{projectRoot}/vite.config.{js,ts,mjs,mts}",
        ],
      },
    ],
  },
  overrides: [
    {
      files: ["*.json", "*.jsonc"],
      parser: "jsonc-eslint-parser",
      parserOptions: {
        ecmaVersion: 2020,
      },
    },
  ],
};
