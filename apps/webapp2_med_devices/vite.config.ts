import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,   // <-- tukaj nastaviš port
    host: true    // če želiš dostop iz drugih naprav (npr. preko LAN)
  }
})

