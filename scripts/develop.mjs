#!/usr/bin/node
import './load-dot-env-variables.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import fs from 'fs-extra';
import { WebSocketServer as WSServer } from 'ws';
import { createServer, createLogger } from 'vite';
import electronPath from 'electron';
import esbuild from 'esbuild';
import chokidar from 'chokidar';
import nativeNodeModulesPlugin from './esbuild-native-node-modules-plugin.mjs';
import { node } from './electron-vendors.mjs';

const rootFolderPath = fileURLToPath(new URL('..', import.meta.url));
const outFolderPath = path.resolve(rootFolderPath, 'out');
const srcFolderPath = path.resolve(rootFolderPath, 'src');

/** @type {import('child_process').ChildProcessWithoutNullStreams | null} */
let electronProcess = null;

const devLogger = createLogger('info', {
  prefix: '[dev]',
});

const mainProcessLogger = createLogger('info', {
  prefix: '[main]',
});

const commonDefine = {
  IS_PRODUCTION: 'false',
  IS_DEV: 'true',
};

const stderrIgnorePatterns = [
  /ExtensionLoadWarning/, // DevTools extension warnings
];

function startElectron() {
  devLogger.info('Starting Electron...', { timestamp: true });
  // You can add app startup arguments in the following array for debugging, example: '--start-path=downloads'
  const args = [path.join(outFolderPath, 'main.js')];
  electronProcess = spawn(String(electronPath), args);
  electronProcess.stdout.on('data', (data) => {
    mainProcessLogger.info(data.toString(), { timestamp: true });
  });
  electronProcess.stderr.on('data', (data) => {
    const string = data.toString().trim();
    const shouldIgnore = stderrIgnorePatterns.some((pattern) => {
      return pattern.test(string);
    });
    if (shouldIgnore) {
      return;
    }
    mainProcessLogger.error(string, { timestamp: true });
  });
  electronProcess.on('exit', (code) => {
    devLogger.info(`Electron process exited with code : ${code}`, { timestamp: true });
    if (code === 0) {
      process.exit(0);
    }
  });
  electronProcess.on('error', (error) => {
    devLogger.error('Electron process error', { timestamp: true });
    devLogger.error(error, { timestamp: true });
  });
}

function killElectronProcess() {
  if (electronProcess !== null) {
    electronProcess.kill('SIGKILL');
    electronProcess = null;
  }
}

function restartElectron() {
  killElectronProcess();
  startElectron();
}

async function buildAndWatchRendererProcessBundle() {
  /** @type {import('vite').InlineConfig} */
  const serverConfig = {
    mode: 'development',
    build: {
      emptyOutDir: false,
      sourcemap: true,
      watch: {},
    },
    logLevel: 'warn',
    configFile: path.join(rootFolderPath, 'vite.config.mts'),
    define: {
      ...commonDefine,
      REACT_STRICT_MODE_ENABLED: process.env.REACT_STRICT_MODE_ENABLED ?? false,
    },
  };
  const devServer = await createServer(serverConfig);
  await devServer.listen();
  const { port } = devServer.config.server;
  process.env.VITE_DEV_SERVER_URL = `http://localhost:${port}/`;
}

async function buildWebSocketProcessBundle() {
  const result = await esbuild.build({
    entryPoints: [path.join(srcFolderPath, 'server/server.ts')],
    outfile: path.join(outFolderPath, 'server.js'),
    bundle: true,
    sourcemap: 'linked',
    platform: 'node',
    target: `node${node}`,
    metafile: true,
    external: [
      'pg-native',
      '@aws-sdk/client-s3', // the unzipper module has it as a dev dependency
    ],
    define: {
      ...commonDefine,
      'process.env.STEAM_API_KEYS': `"${process.env.STEAM_API_KEYS}"`,
    },
    plugins: [
      nativeNodeModulesPlugin,
      {
        name: 'restart-electron-on-build-start',
        setup(build) {
          build.onStart(() => {
            // Kill Electron process on build starts to make sure the process releases .node files lock.
            killElectronProcess();
          });
        },
      },
    ],
  });

  const files = Object.keys(result.metafile.inputs);
  return files;
}

async function buildMainProcessBundle() {
  const result = await esbuild.build({
    entryPoints: [path.join(srcFolderPath, 'electron-main/main.ts')],
    outfile: path.join(outFolderPath, 'main.js'),
    bundle: true,
    sourcemap: 'linked',
    platform: 'node',
    target: `node${node}`,
    external: ['electron'],
    define: commonDefine,
    metafile: true,
    plugins: [nativeNodeModulesPlugin],
  });

  async function copyTranslations() {
    const translationsFolder = path.resolve(srcFolderPath, 'electron-main', 'translations');
    const outputFolder = path.resolve(outFolderPath, 'translations');
    await fs.copy(translationsFolder, outputFolder);
  }

  await copyTranslations();

  const files = Object.keys(result.metafile.inputs);
  return files;
}

async function buildPreloadBundle() {
  const result = await esbuild.build({
    entryPoints: [path.join(srcFolderPath, 'preload/preload.ts')],
    outfile: path.join(outFolderPath, 'preload.js'),
    bundle: true,
    sourcemap: 'inline',
    platform: 'node',
    target: `node${node}`,
    external: ['electron'],
    define: {
      ...commonDefine,
    },
    metafile: true,
    plugins: [nativeNodeModulesPlugin],
  });

  const files = Object.keys(result.metafile.inputs);
  return files;
}

async function buildDevPreloadBundle() {
  const result = await esbuild.build({
    entryPoints: [path.join(srcFolderPath, 'server/dev-preload.ts')],
    outfile: path.join(outFolderPath, 'dev-preload.js'),
    bundle: true,
    platform: 'node',
    target: `node${node}`,
    external: ['electron'],
    metafile: true,
  });

  const files = Object.keys(result.metafile.inputs);
  return files;
}

async function copyDevRendererHtml() {
  const htmlFilePath = path.resolve(srcFolderPath, 'server', 'dev.html');
  const outHtmlFilePath = path.resolve(outFolderPath, 'dev.html');
  await fs.copyFile(htmlFilePath, outHtmlFilePath);
}

async function buildMainProcessBundles() {
  const webSocketFiles = await buildWebSocketProcessBundle();
  const mainFiles = await buildMainProcessBundle();
  const preloadFiles = await buildPreloadBundle();
  const devPreloadFiles = await buildDevPreloadBundle();
  const files = [...new Set([...webSocketFiles, ...mainFiles, ...preloadFiles, ...devPreloadFiles])];

  return files;
}

/**
 * We don't use the esbuild watch feature because (as of version 0.12.9) it watches for the whole folder tree,
 * even parent folders. It makes restarting Electron when it's not necessary.
 * Related issue https://github.com/evanw/esbuild/issues/1113
 * Instead we use chokidar to rebuild bundles and restart Electron when a file that requires a full Electron restart changed.
 */
async function buildAndWatchMainProcessBundles() {
  const files = await buildMainProcessBundles();
  const watcher = chokidar.watch(files);
  watcher.on('change', async () => {
    try {
      await buildMainProcessBundles();
    } catch (error) {
    } finally {
      restartElectron();
    }
  });
}

async function assertWebSocketServerIsAvailable() {
  const port = 4574;
  return new Promise((resolve) => {
    const server = new WSServer({
      port,
    });

    server.on('error', (error) => {
      if (error.code === 'EACCES') {
        console.error(`You don't have permission to run the WebSocket server on port ${port}.`);
      }
      if (error.code === 'EADDRINUSE') {
        console.error(
          `A WebSocket server is already running on port ${port}. Please make sure to quit all running CS:DM application and retry.`,
        );
      } else {
        console.error(error);
      }
      process.exit(1);
    });

    server.on('listening', () => {
      server.close();
      return resolve();
    });
  });
}

try {
  await fs.ensureDir(outFolderPath);
  await assertWebSocketServerIsAvailable();

  await Promise.all([buildAndWatchRendererProcessBundle(), buildAndWatchMainProcessBundles(), copyDevRendererHtml()]);
  startElectron();
} catch (error) {
  devLogger.error(error, { timestamp: true });
  process.exit(1);
}

process.on('SIGINT', () => {
  killElectronProcess();
  process.exit(0);
});
