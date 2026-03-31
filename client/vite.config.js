import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // This correctly routes any API calls made by Axios to our Node backend.
    // E.g. axios.get('/api/services') becomes http://localhost:5000/api/services internally!
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
