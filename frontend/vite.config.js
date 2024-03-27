import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@emotion/core": "@emotion/react",
      "emotion-theming": "@emotion/react",
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      input: "./src/main.jsx", // Update this to match your entry point file
      output: {
        entryFileNames: "assets/[name].js", // Specify the entry file name pattern
        chunkFileNames: "assets/[name].js", // Specify the chunk file name pattern
        assetFileNames: "assets/[name].[ext]", // Specify the asset file name pattern
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://backend:5000",
        changeOrigin: true,
      },
    },
  },
});
