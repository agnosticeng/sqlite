import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: ["@sqlite.org/sqlite-wasm"],
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/sqlite.ts"),
      name: "SQLite",
      fileName: "sqlite",
      formats: ["es", "cjs", "umd"],
    },
    rollupOptions: {
      external: ["@sqlite.org/sqlite-wasm"],
    },
  },
});
