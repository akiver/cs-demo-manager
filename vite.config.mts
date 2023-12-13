import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { lingui } from '@lingui/vite-plugin';
import { chrome } from './scripts/electron-vendors.mjs';
import pkg from './package.json';

const currentFolderPath = fileURLToPath(new URL('.', import.meta.url));
const srcFolderPath = path.resolve(currentFolderPath, 'src');
const rendererFolderPath = path.resolve(srcFolderPath, 'ui');

export default defineConfig({
  root: process.env.VITEST ? '' : rendererFolderPath,
  resolve: {
    alias: {
      csdm: srcFolderPath,
    },
  },
  base: '',
  build: {
    outDir: path.resolve(currentFolderPath, 'out'),
    target: `chrome${chrome}`,
    sourcemap: true,
  },
  define: {
    APP_VERSION: `"${pkg.version}"`,
  },
  plugins: [
    react({
      babel: {
        plugins: ['macros'],
      },
    }),
    lingui(),
  ],
});
