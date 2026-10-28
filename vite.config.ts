import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import pkg from './package.json' with { type: 'json' };

export default defineConfig({
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { host: true, port: 5173 },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        // Long-lived vendor chunk: app deploys don't invalidate the framework in users' caches.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\/](react|react-dom|scheduler)[\/]/.test(id)) return 'react';
          if (/[\/](react-router|cookie|set-cookie-parser)[\/]/.test(id)) return 'router';
          if (id.includes('@tanstack')) return 'query';
          return undefined;
        },
      },
    },
  },
});
