const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const vite_tsconfig_paths_1 = __importDefault(require("vite-tsconfig-paths"));
const config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
  plugins: [(0, plugin_react_1.default)(), (0, vite_tsconfig_paths_1.default)()],
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
//# sourceMappingURL=vitest.config.js.map
