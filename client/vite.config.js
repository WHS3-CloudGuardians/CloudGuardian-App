// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,            // 외부 접속 필요 시
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
     '/uploads': {
       target: 'http://localhost:3000',
       changeOrigin: true,
       secure: false,
     },
    },
  },
});
