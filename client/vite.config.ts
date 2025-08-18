import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

export default defineConfig({
  plugins: [react()],
  server: {
    host: process.env.VITE_HOST || '0.0.0.0',
    port: Number(process.env.VITE_PORT) || 3001,
    allowedHosts: ["nota.logidoc.pro"],
    proxy: {
      // qualquer chamada a /api/avaliacao vai para o IP interno
      '/api': {
        target: 'http://206.183.129.2:4001',
        changeOrigin: true,
        secure: false,     // aceita certs self-signed
        rewrite: path => path.replace(/^\/api/, ''),
      },
  },
}
})
