import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { lingui } from '@lingui/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import babel, { defineRolldownBabelPreset } from '@rolldown/plugin-babel';
import { chrome } from './scripts/electron-vendors.mjs';
import pkg from './package.json';

const currentFolderPath = fileURLToPath(new URL('.', import.meta.url));
const srcFolderPath = path.resolve(currentFolderPath, 'src');
const rendererFolderPath = path.resolve(srcFolderPath, 'ui');
// https://github.com/lingui/js-lingui/issues/2477#issuecomment-4068015629
const linguiPreset = defineRolldownBabelPreset({
  preset: () => ({ plugins: ['@lingui/babel-plugin-lingui-macro'] }),
  rolldown: {
    filter: {
      code: /from ['"]@lingui\/(?:react|core)\/macro['"]/,
    },
  },
});

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
    react(),
    lingui(),
    babel({
      presets: [reactCompilerPreset(), linguiPreset],
    }),
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
