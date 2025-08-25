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
      outDir: "dist-browser",
      staticImport: true,
      tsconfigPath: "./tsconfig.build.json",
    }),
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "@sitepins/mdx-parser",
      fileName: "index.browser",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom"],
    },
    sourcemap: true,
    minify: false,
    outDir: "dist-browser",
  },
  assetsInclude: ["**/*.md"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "^.*\\.md\\?raw$": "$&",
    },
  },
});
