import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    rollupOptions: {
      input: {
        index: "./src/index.ts",
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
