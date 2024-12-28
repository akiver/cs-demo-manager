#!/usr/bin/node
import './load-dot-env-variables.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { build } from 'vite';
import esbuild from 'esbuild';
import nativeNodeModulesPlugin from './esbuild-native-node-modules-plugin.mjs';
import { node } from './electron-vendors.mjs';

const rootFolderPath = fileURLToPath(new URL('..', import.meta.url));
const srcFolderPath = path.resolve(rootFolderPath, 'src');
const outFolderPath = path.resolve(rootFolderPath, 'out');

const commonDefine = {
  IS_PRODUCTION: 'true',
  IS_DEV: 'false',
};

async function buildRendererProcessBundle() {
  await build({
    mode: 'production',
    build: {
      emptyOutDir: true,
      sourcemap: true,
      chunkSizeWarningLimit: 3000,
    },
    configFile: path.join(rootFolderPath, 'vite.config.mts'),
    esbuild: {
      // Do not minify identifiers in order to have real functions name in logs that are written on the FS.
      // I didn't find a way to have logs in production builds pointing to the actual .ts/.tsx file.
      // Unfortunately the module source-map-support doesn't help here even when using the browser version.
      // It increases the bundle size but makes logs much more readable.
      // Note: Opening the DevTools console in production builds will show the original .ts/.tsx file.
      minifyIdentifiers: false,
    },
    define: {
      ...commonDefine,
      REACT_STRICT_MODE_ENABLED: false,
    },
  });
}

async function buildWebSocketServerBundle() {
  await esbuild.build({
    entryPoints: [path.join(srcFolderPath, 'server/server.ts')],
    outfile: path.join(outFolderPath, 'server.js'),
    bundle: true,
    sourcemap: 'linked',
    minify: true,
    platform: 'node',
    target: `node${node}`,
    mainFields: ['module', 'main'],
    external: [
      'pg-native',
      '@aws-sdk/client-s3', // the unzipper module has it as a dev dependency
    ],
    define: {
      ...commonDefine,
      'process.env.STEAM_API_KEYS': `"${process.env.STEAM_API_KEYS}"`,
      'process.env.FACEIT_API_KEY': `"${process.env.FACEIT_API_KEY}"`,
    },
    plugins: [nativeNodeModulesPlugin],
  });
}

async function buildMainProcessBundle() {
  await esbuild.build({
    entryPoints: [path.join(srcFolderPath, 'electron-main/main.ts')],
    outfile: path.join(outFolderPath, 'main.js'),
    bundle: true,
    sourcemap: 'linked',
    minify: true,
    platform: 'node',
    target: `node${node}`,
    mainFields: ['module', 'main'],
    external: ['electron'],
    define: commonDefine,
    plugins: [nativeNodeModulesPlugin],
  });

  async function copyTranslations() {
    const translationsFolder = path.resolve(srcFolderPath, 'electron-main', 'translations');
    const outputFolder = path.resolve(outFolderPath, 'translations');
    await fs.copy(translationsFolder, outputFolder);
  }

  await copyTranslations();
}

async function buildPreloadBundle() {
  await esbuild.build({
    entryPoints: [path.join(srcFolderPath, 'preload/preload.ts')],
    outfile: path.join(outFolderPath, 'preload.js'),
    bundle: true,
    sourcemap: 'inline',
    minify: true,
    platform: 'node',
    target: `node${node}`,
    mainFields: ['module', 'main'],
    external: ['electron'],
    define: {
      ...commonDefine,
    },
    plugins: [nativeNodeModulesPlugin],
  });
}

async function buildCliBundle() {
  await esbuild.build({
    entryPoints: [path.join(srcFolderPath, 'cli/cli.ts')],
    outfile: path.join(outFolderPath, 'cli.js'),
    bundle: true,
    sourcemap: true,
    minify: true,
    platform: 'node',
    target: `node${node}`,
    mainFields: ['module', 'main'],
    define: {
      ...commonDefine,
      'process.env.STEAM_API_KEYS': `"${process.env.STEAM_API_KEYS}"`,
      'process.env.FACEIT_API_KEY': `"${process.env.FACEIT_API_KEY}"`,
    },
    external: ['pg-native'],
    plugins: [nativeNodeModulesPlugin],
  });
}

try {
  await buildRendererProcessBundle();
  await Promise.all([buildWebSocketServerBundle(), buildMainProcessBundle(), buildPreloadBundle(), buildCliBundle()]);
} catch (error) {
  console.error(error);
  process.exit(1);
}
