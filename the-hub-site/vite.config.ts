import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  preview: {
    port: parseInt(process.env.PORT || '4173'),
    host: '0.0.0.0',
    allowedHosts: ['all'],
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
  appType: 'spa',
})
