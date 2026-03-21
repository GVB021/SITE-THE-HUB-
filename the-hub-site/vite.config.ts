import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['all', '.up.railway.app', 'hub-production-a1c1.up.railway.app', 'localhost', '.localhost'],
    host: '0.0.0.0',
    port: 5173
  },
  preview: {
    allowedHosts: ['all', '.up.railway.app', 'hub-production-a1c1.up.railway.app', 'localhost', '.localhost'],
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '4173')
  }
})
