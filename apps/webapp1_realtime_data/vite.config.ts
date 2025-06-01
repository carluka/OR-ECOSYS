import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    //port: 5173,  <--- CHANGE TO THIS FOR PRODUCTION
    port: 3001,
    host: true,
    allowedHosts: ["or-ecosystem.eu", "data.or-ecosystem.eu"],
  },
});
