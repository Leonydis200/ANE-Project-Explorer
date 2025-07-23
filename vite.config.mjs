import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import path from 'path';

export default defineConfig({
  plugins: [
    eslint({
      overrideConfigFile: path.resolve(__dirname, '.eslintrc.json'),
      // Optional: emit warnings instead of errors to avoid build failure
      // emitWarning: true,
      // Optional: fix lint errors on save
      // fix: true,
    }),
  ],
});
