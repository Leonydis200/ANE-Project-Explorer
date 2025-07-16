import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react({ jsxRuntime: 'classic' }),
    visualizer({ open: true }), // opens browser after build with bundle report
  ],
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
      usePolling: true, // Useful for some WSL environments
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true, // Helps with debugging
    chunkSizeWarningLimit: 1000, // Increase warning limit in KB

    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'vendor_react';
            }
            if (id.includes('@tensorflow/tfjs')) {
              return 'vendor_tfjs';
            }
            if (id.includes('rxjs')) {
              return 'vendor_rxjs';
            }
            if (id.includes('socket.io-client')) {
              return 'vendor_socketio';
            }
            if (id.includes('lucide-react')) {
              return 'vendor_lucide';
            }
            return 'vendor_misc';
          }
        },
      },
    },
  },
});
