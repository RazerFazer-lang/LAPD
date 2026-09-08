import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/LAPD/' : '/',
  plugins: [
    react(),
    {
      name: 'american-dispatch-real-map',
      enforce: 'pre',
      transform(code, id) {
        if (id.endsWith('/src/App.tsx')) {
          return code.replace("from './ui/MapView'", "from './ui/RealMapView'");
        }
        return null;
      },
    },
  ],
  server: { port: 5173 },
});
