import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // vite.config.js
  server: {
    hmr: {
      protocol: 'ws', // Ensure WebSocket is used
      host: 'localhost',
      port: 3000,
    },
  },

  plugins: [react()],
})
