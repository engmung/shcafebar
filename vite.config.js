import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    fs: {
      allow: ["."],
    },
  },
  optimizeDeps: {
    exclude: ["fs"],
  },
  build: {
    rollupOptions: {
      external: ["fs"],
    },
  },
  server: {
    port: 3001,
    host: true, // 이 줄을 추가합니다.
  },
});
