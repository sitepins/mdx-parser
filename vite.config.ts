import path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      copyDtsFiles: true,
      include: ["src/**/*.ts", "src/**/*.d.ts"],
    }),
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "@sitepins/mdx-parser",
    },
    rollupOptions: {
      external: [
        // All your dependencies should be external
        "acorn",
        "ccount",
        "estree-util-is-identifier-name",
        "happy-dom",
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
        // React - external as peer dependency
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      output: [
        // ESM build - for Next.js, modern React apps, and Node.js ESM
        {
          format: "es",
          entryFileNames: "index.mjs",
        },
        // CJS build - for older Node.js and legacy React apps
        {
          format: "cjs",
          entryFileNames: "index.js",
        },
      ],
    },
    sourcemap: true,
    minify: false,
  },
  assetsInclude: ["**/*.md"],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
});
