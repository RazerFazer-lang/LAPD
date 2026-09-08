import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // The production site uses the custom domain leitstelle.verion-digital.de,
  // so assets must resolve from the domain root instead of /LAPD/.
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
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
