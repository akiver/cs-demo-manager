#!/usr/bin/node
// @ts-check
import './load-dot-env-variables.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import fs from 'fs-extra';
import { build } from 'vite-plus';
import { build as rolldownBuild } from 'vite/rolldown';
import nativeNodeModulesPlugin from './rolldown-native-node-modules-plugin.mjs';
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

/**
 * @param {object} options
 * @param {string} options.entryPoint Entry file path relative to the src folder.
 * @param {string} options.outputFileName Output file name written in the out folder.
 * @param {Record<string, string>} [options.define] Additional constants replaced at build time.
 * @param {import('vite/rolldown').ExternalOption} [options.external] Modules to keep external to the bundle.
 * @param {import('vite/rolldown').OutputOptions['sourcemap']} [options.sourcemap]
 * @returns {import('vite/rolldown').BuildOptions}
 */
function createNodeBundleOptions({ entryPoint, outputFileName, define = {}, external = [], sourcemap = true }) {
  return {
    input: path.join(srcFolderPath, entryPoint),
    platform: 'node',
    resolve: {
      mainFields: ['module', 'main'],
    },
    external,
    transform: {
      target: `node${node}`,
      define: {
        ...commonDefine,
        ...define,
      },
    },
    plugins: [nativeNodeModulesPlugin],
    output: {
      file: path.join(outFolderPath, outputFileName),
      format: 'cjs',
      sourcemap,
      minify: true,
      codeSplitting: false,
    },
  };
}

async function buildWebSocketServerBundle() {
  await rolldownBuild(
    createNodeBundleOptions({
      entryPoint: 'server/start-server.ts',
      outputFileName: 'server.js',
      external: [
        'pg-native',
        '@aws-sdk/client-s3', // the unzipper module has it as a dev dependency
      ],
      define: {
        'process.env.STEAM_API_KEYS': `"${process.env.STEAM_API_KEYS}"`,
        'process.env.FACEIT_API_KEY': `"${process.env.FACEIT_API_KEY}"`,
      },
    }),
  );
}

async function buildMainProcessBundle() {
  await rolldownBuild(
    createNodeBundleOptions({
      entryPoint: 'electron-main/main.ts',
      outputFileName: 'main.js',
      external: ['electron', 'electron/main'],
    }),
  );

  async function copyTranslations() {
    const translationsFolder = path.resolve(srcFolderPath, 'electron-main', 'translations');
    const outputFolder = path.resolve(outFolderPath, 'translations');
    await fs.copy(translationsFolder, outputFolder);
  }

  await copyTranslations();
}

async function buildPreloadBundle() {
  await rolldownBuild(
    createNodeBundleOptions({
      entryPoint: 'preload/preload.ts',
      outputFileName: 'preload.js',
      external: ['electron'],
      sourcemap: 'inline',
    }),
  );
}

async function buildCliBundle() {
  await rolldownBuild(
    createNodeBundleOptions({
      entryPoint: 'cli/cli.ts',
      outputFileName: 'cli.js',
      external: ['pg-native', '@aws-sdk/client-s3'],
      define: {
        'process.env.STEAM_API_KEYS': `"${process.env.STEAM_API_KEYS}"`,
        'process.env.FACEIT_API_KEY': `"${process.env.FACEIT_API_KEY}"`,
      },
    }),
  );
}

try {
  downloadTranslations();
  await buildRendererProcessBundle();
  await Promise.all([buildWebSocketServerBundle(), buildMainProcessBundle(), buildPreloadBundle(), buildCliBundle()]);
} catch (error) {
  console.error(error);
  process.exit(1);
}
