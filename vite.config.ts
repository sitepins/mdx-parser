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
    }),
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "@sitepins/mdx-parser",
      fileName: (format) => {
        if (format === "es") return "index.mjs";
        if (format === "cjs") return "index.js";
        return "index.js";
      },
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "acorn",
        "ccount",
        "estree-util-is-identifier-name",
        "lodash.flatten",
        "mdast-util-compact",
        "mdast-util-directive",
        "mdast-util-from-markdown",
        "mdast-util-gfm",
        "mdast-util-mdx-jsx",
        "mdast-util-to-markdown",
        "micromark-extension-gfm",
        "micromark-factory-mdx-expression",
        "micromark-factory-space",
        "micromark-factory-whitespace",
        "micromark-util-character",
        "micromark-util-symbol",
        "micromark-util-types",
        "parse-entities",
        "prettier",
        "remark",
        "remark-gfm",
        "remark-mdx",
        "stringify-entities",
        "unist-util-source",
        "unist-util-stringify-position",
        "unist-util-visit",
        "uvu",
        "vfile-message",
        "react",
        "react-dom",
      ],
    },
    sourcemap: true,
    minify: false,
  },
  assetsInclude: ["**/*.md"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "^.*\\.md\\?raw$": "$&",
    },
  },
});
