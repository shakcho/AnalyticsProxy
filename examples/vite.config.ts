import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Toggle between source and dist build
const USE_DIST = process.env.USE_DIST === 'true';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: USE_DIST 
      ? {
          // Use the built dist from parent directory
          'analytics-proxy': resolve(__dirname, '../dist/index.mjs'),
        }
      : {
          // Use the source from parent directory during development (default)
          'analytics-proxy': resolve(__dirname, '../src/index.ts'),
        },
  },
  server: {
    port: 3000,
    open: true,
  },
});

