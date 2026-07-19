#!/usr/bin/node
import './load-dot-env-variables.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import fs from 'fs-extra';
import { build } from 'vite-plus';
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

function downloadTranslations() {
  if (!process.env.CROWDIN_PERSONAL_TOKEN) {
    console.warn(
      'CROWDIN_PERSONAL_TOKEN is not set, skipping translations download. The build will only include English.',
    );
    console.warn(
      `If you want to download translations, you must:
      1. Create a Crowdin account (https://crowdin.com)
      2. Request to join the project on Crowdin and wait to be granted access
      3. Generate a personal access token (https://crowdin.com/settings#api-key)
      4. Set the CROWDIN_PERSONAL_TOKEN environment variable to your token
      5. Re-run this build script`,
    );
    return;
  }

  const result = spawnSync('crowdin download', {
    cwd: rootFolderPath,
    stdio: 'inherit',
    shell: true,
  });

  if (result.status !== 0) {
    throw new Error('Failed to download translations from Crowdin.');
  }
}

async function buildRendererProcessBundle() {
  await build({
    mode: 'production',
    build: {
      emptyOutDir: true,
      sourcemap: true,
      chunkSizeWarningLimit: 4500,
      rolldownOptions: {
        output: {
          // Do not minify identifiers in order to have real functions name in logs that are written on the FS.
          // I didn't find a way to have logs in production builds pointing to the actual .ts/.tsx file.
          // Unfortunately the module source-map-support doesn't help here even when using the browser version.
          // It increases the bundle size but makes logs much more readable.
          // Note: Opening the DevTools console in production builds will show the original .ts/.tsx file.
          keepNames: true,
        },
      },
    },
    configFile: path.join(rootFolderPath, 'vite.config.ts'),
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
    alias: {
      // Force fdir to use the CJS version to avoid createRequire(import.meta.url) not working
      fdir: './node_modules/fdir/dist/index.cjs',
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
    external: ['pg-native', '@aws-sdk/client-s3'],
    alias: {
      // Force fdir to use the CJS version to avoid createRequire(import.meta.url) not working
      fdir: './node_modules/fdir/dist/index.cjs',
    },
    plugins: [nativeNodeModulesPlugin],
  });
}

try {
  downloadTranslations();
  await buildRendererProcessBundle();
  await Promise.all([buildWebSocketServerBundle(), buildMainProcessBundle(), buildPreloadBundle(), buildCliBundle()]);
} catch (error) {
  console.error(error);
  process.exit(1);
}
