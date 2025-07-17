import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve';
  
  return {
    plugins: [
      react(),
      tsconfigPaths(),
      isDev && checker({
        typescript: true,
        eslint: {
          lintCommand: 'eslint . --ext .ts,.tsx',
        },
      }),
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: isDev,
      minify: !isDev ? 'esbuild' : false,
    },
    define: {
      'process.env': process.env,
    },
  };
});