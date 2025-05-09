import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { dirname, resolve } from "node:path";
// https://vite.dev/config/
const _fileName = fileURLToPath(import.meta.url);
const _dirName = dirname(_fileName);
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    extensions: [".js", ".jsx", ".ts", ".tsx"], // 添加你希望支持的后缀
  },
  build: {
    outDir: resolve(_dirName, "../webViewDist"),
  },
});
