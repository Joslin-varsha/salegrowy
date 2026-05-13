import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],

  server: {
    proxy: {
      '/api': {
        target: 'http://52.66.85.100:3000/',
        changeOrigin: true,
        secure: false
      }
    }
  }
})