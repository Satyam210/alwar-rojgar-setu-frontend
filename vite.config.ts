import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vite.dev/config/
// `base` must match the GitHub Pages project path (https://<user>.github.io/alwar-rojgar-setu/).
// Kept at '/' for local dev so routing and assets work unchanged.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/alwar-rojgar-setu/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to the backend during local development.
      '/api': {
        target: process.env.VITE_PROXY_TARGET ?? 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          pdf: ['@react-pdf/renderer'],
        },
      },
    },
  },
}));
