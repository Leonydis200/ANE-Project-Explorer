import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';

  return {
    plugins: [
      react(),
      tsconfigPaths(),

      // Run type checking and ESLint only in development mode
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
        '@': path.resolve(__dirname, './src'), // Use '@' as alias to 'src'
      },
    },

    server: {
      port: 3000,
      open: true, // Automatically open browser on dev server start
    },

    build: {
      outDir: 'dist',
      sourcemap: isDev,            // Generate source maps in dev
      minify: isDev ? false : 'esbuild', // Use esbuild for minification in production
    },

    define: {
      'import.meta.env.DEV': isDev,
      'import.meta.env.PROD': !isDev,
      'import.meta.env.VITE_APP_NAME': JSON.stringify(process.env.VITE_APP_NAME ?? 'Application'),
      'process.env': process.env, // Compatibility for libraries referencing process.env
    },
  };
});
