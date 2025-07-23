// @ts-nocheck
/* global module, require */
// @ts-nocheck
/* global module, require */
// @ts-nocheck
/* global module, require */
// @ts-nocheck
/* global module, require */
import { fileURLToPath } from 'url';
import path from 'path';
/* eslint-env node */
import { defineConfig } from 'vite';

import eslint from 'vite-plugin-eslint';

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
