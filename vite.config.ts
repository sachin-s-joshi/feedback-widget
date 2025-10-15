import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './demo',
  build: {
    outDir: '../demo-dist',
    rollupOptions: {
      input: {
        main: './demo/index.html',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});