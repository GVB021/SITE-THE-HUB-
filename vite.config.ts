import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['all'],
    host: true
  },
  preview: {
    allowedHosts: ['all', 'hub-production-a1c1.up.railway.app', '.up.railway.app'],
    host: true
  }
})
