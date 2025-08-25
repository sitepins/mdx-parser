import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node", // Simulates browser for tests
    include: ["src/**/*.test.ts"],
    setupFiles: ["./jest.setup.js"],
  },
  resolve: {
    alias: {
      "@": resolve(process.cwd(), "./src"),
    },
  },
});
