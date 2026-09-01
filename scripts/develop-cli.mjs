#!/usr/bin/node
// @ts-check
import './load-dot-env-variables.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { watch } from 'vite/rolldown';
import nativeNodeModulesPlugin from './rolldown-native-node-modules-plugin.mjs';
import { node } from './electron-vendors.mjs';

const rootFolderPath = fileURLToPath(new URL('..', import.meta.url));
const outFolderPath = path.resolve(rootFolderPath, 'out');
const srcFolderPath = path.resolve(rootFolderPath, 'src');

/**
 * @type {import('vite/rolldown').WatchOptions}
 */
const commonOptions = {
  platform: 'node',
  transform: {
    target: `node${node}`,
    define: {
      IS_PRODUCTION: 'false',
      IS_DEV: 'true',
      'process.env.STEAM_API_KEYS': `"${process.env.STEAM_API_KEYS}"`,
      'process.env.FACEIT_API_KEY': `"${process.env.FACEIT_API_KEY}"`,
    },
  },
  external: [
    'pg-native',
    '@aws-sdk/client-s3', // the unzipper module has it as a dev dependency
  ],
  plugins: [nativeNodeModulesPlugin],
};

/**
 * @type {import('vite/rolldown').OutputOptions}
 */
const commonOutputOptions = {
  format: 'cjs',
  sourcemap: true,
  codeSplitting: false,
};

watch([
  {
    ...commonOptions,
    input: path.join(srcFolderPath, 'cli/cli.ts'),
    output: {
      ...commonOutputOptions,
      file: path.join(outFolderPath, 'cli.js'),
    },
  },
  // The CLI spawns the WebSocket server daemon, build it as well.
  {
    ...commonOptions,
    input: path.join(srcFolderPath, 'server/start-server.ts'),
    output: {
      ...commonOutputOptions,
      file: path.join(outFolderPath, 'server.js'),
    },
  },
]);
