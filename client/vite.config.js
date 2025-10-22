import path from "path";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Use a single proxy rule for all backend requests
      '/pins': 'http://localhost:5000',
      '/signup': 'http://localhost:5000',
      '/login': 'http://localhost:5000',
      '/logout': 'http://localhost:5000',
      '/auth': 'http://localhost:5000',   // For Google login
      '/api': 'http://localhost:5000',    // For our new auth check
    }
  }
})
