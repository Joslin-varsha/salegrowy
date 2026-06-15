import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  server: {
    proxy: {
      '/api': {
        target: '${import.meta.env.VITE_API_URL}/',
        changeOrigin: true,
        secure: false
      }
    }
  }
})