Object.defineProperty(exports, "__esModule", { value: true });
const nx_tsconfig_paths_plugin_1 = require("@nx/vite/plugins/nx-tsconfig-paths.plugin");
const config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
  plugins: [(0, nx_tsconfig_paths_plugin_1.nxViteTsPaths)()],
  test: {
    globals: true,
    cache: {
      dir: "../../node_modules/.vitest",
    },
    environment: "node",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "test/", "src/**/*.spec.ts", "src/**/*.test.ts"],
    },
  },
});
//# sourceMappingURL=vitest.config.js.map
