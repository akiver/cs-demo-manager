import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { lingui } from '@lingui/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
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
        plugins: ['@lingui/babel-plugin-lingui-macro', 'babel-plugin-react-compiler'],
      },
    }),
    lingui(),
    tailwindcss(),
    {
      name: 'write-changelog-file',
      async closeBundle() {
        // Write a dummy changelog file that will be used to determine if the changelog dialog should be shown.
        await fs.writeFile('./static/changelog', '', 'utf-8');
      },
    },
  ],
});
