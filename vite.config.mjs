/* eslint-env node */
import { defineConfig } from 'vite';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);;
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
