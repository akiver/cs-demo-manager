#!/usr/bin/node
import './load-dot-env-variables.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';
import { node } from './electron-vendors.mjs';
import nativeNodeModulesPlugin from './esbuild-native-node-modules-plugin.mjs';

const rootFolderPath = fileURLToPath(new URL('..', import.meta.url));
const outFolderPath = path.resolve(rootFolderPath, 'out');
const srcFolderPath = path.resolve(rootFolderPath, 'src');

const context = await esbuild.context({
  entryPoints: [path.join(srcFolderPath, 'cli/cli.ts')],
  outfile: path.join(outFolderPath, 'cli.js'),
  bundle: true,
  sourcemap: true,
  platform: 'node',
  target: `node${node}`,
  define: {
    IS_PRODUCTION: 'false',
    IS_DEV: 'true',
    'process.env.STEAM_API_KEYS': `"${process.env.STEAM_API_KEYS}"`,
    'process.env.FACEIT_API_KEY': `"${process.env.FACEIT_API_KEY}"`,
  },
  external: [
    'pg-native',
    '@aws-sdk/client-s3', // the unzipper module has it as a dev dependency
    'registry-js',
    'fdir',
  ],
  plugins: [nativeNodeModulesPlugin],
});

await context.watch();
