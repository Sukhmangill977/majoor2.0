// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/backend': {
        target: 'http://localhost:3000', // Update this to your backend URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
