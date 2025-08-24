import path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: false,
      copyDtsFiles: true,
      include: ["src/**/*.ts", "src/**/*.d.ts"],
      exclude: [
        "src/__test__/**/*",
        "src/**/__tests__/**/*",
        "src/**/*.test.ts",
      ],
      outDir: "dist",
      staticImport: true,
      tsconfigPath: "./tsconfig.build.json",
    }),
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "@sitepins/mdx-parser",
      fileName: (format) => `index.browser.${format === "es" ? "js" : "js"}`,
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        format: "es",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    sourcemap: true,
    minify: false,
    outDir: "dist",
  },
  assetsInclude: ["**/*.md"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "^.*\\.md\\?raw$": "$&",
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    mainFields: ["module", "main"],
    conditions: ["import", "module", "browser", "default"],
  },
});
