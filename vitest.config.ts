import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const rootDir = fileURLToPath(new URL("./", import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true
  },
  resolve: {
    alias: {
      "@/": `${resolve(rootDir, ".")}/`
    }
  },
  esbuild: {
    loader: "tsx",
    jsx: "automatic"
  }
});
