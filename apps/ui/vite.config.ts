import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import VuePlugin from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VuePlugin(),
    viteSingleFile()
  ],
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    rollupOptions: {
      input: {
        index: "./index.html",
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@root": fileURLToPath(new URL("../../", import.meta.url)),
    },
  },
});
