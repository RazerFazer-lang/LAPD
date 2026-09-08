import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/LAPD/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/ws': {
        target: 'ws://127.0.0.1:8787',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ws/, ''),
      },
    },
  },
});
