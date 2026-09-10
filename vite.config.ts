import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vite.dev/config/
// Served at the domain root on Vercel, so base stays '/' in every mode.
export default defineConfig(({ mode }) => {
  // Load .env* so VITE_PROXY_TARGET from the local .env is honoured here (Vite
  // only injects VITE_* into import.meta.env, not into process.env at config time).
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_PROXY_TARGET ?? 'http://localhost:8080';

  return {
  base: '/',
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
        target: proxyTarget,
        changeOrigin: true,
      },
      // Proxy uploaded files (logos etc.) to the backend in dev.
      '/uploads': {
        target: proxyTarget,
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
  };
});
