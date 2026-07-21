import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev mode, /api calls are proxied to the local backend (port 5099).
// In production, nginx handles the proxying (see nginx.conf).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_TARGET || "http://localhost:5099",
        changeOrigin: true,
      },
    },
  },
});
