import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    fs: {
      allow: [".."],
    },
    port: 3001,
    host: true,
  },
  optimizeDeps: {
    exclude: ["fs"],
  },
  build: {
    rollupOptions: {
      external: ["fs"],
    },
  },
  assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.svg"],
});
