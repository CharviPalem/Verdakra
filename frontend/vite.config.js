import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import 'dotenv/config'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL ? 'https://verdakra-bknd.onrender.com' : 'http://localhost:5000',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
})


