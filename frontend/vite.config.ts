import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Im Dev-Modus werden /api-Aufrufe an das lokale Backend (Port 5099) weitergeleitet.
// In Produktion übernimmt nginx das Proxying (siehe nginx.conf).
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
