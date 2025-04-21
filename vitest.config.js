import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*/vite.config.ts", "**/*/vitest.config.ts"],
  },
});
