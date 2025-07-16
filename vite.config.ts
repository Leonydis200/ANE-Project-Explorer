import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'classic' // Add this if using older React versions
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    open: true,
    watch: {
      usePolling: true // Useful for some WSL environments
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true // Helps with debugging
  }
});