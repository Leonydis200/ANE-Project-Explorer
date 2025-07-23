import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve';

  return {
    plugins: [
      react(),
      tsconfigPaths(),
      isDev &&
        checker({
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
      minify: isDev ? false : 'esbuild',
    },

    define: {
      'import.meta.env.DEV': isDev,
      'import.meta.env.PROD': !isDev,
      'import.meta.env.VITE_APP_NAME': JSON.stringify(process.env.VITE_APP_NAME || 'Application'),
      // Optional: define process.env for compatibility if needed
      'process.env': process.env,
    },
  };
});
