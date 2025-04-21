const baseConfig = require("../../.eslintrc.cjs");

module.exports = {
    ...baseConfig,
    ignorePatterns: ["dist/**/*"],
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
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
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