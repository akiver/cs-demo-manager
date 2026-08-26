#!/usr/bin/node
// @ts-check
import './load-dot-env-variables.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import fs from 'fs-extra';
import { createServer, createLogger } from 'vite-plus';
import electronPath from 'electron';
import { watch } from 'vite/rolldown';
import nativeNodeModulesPlugin from './rolldown-native-node-modules-plugin.mjs';
import { node } from './electron-vendors.mjs';
import { resolveAppFolderPath } from '../src/node/filesystem/resolve-app-folder-path.ts';
import { SERVER_INSPECTOR_PORT, RENDERER_REMOTE_DEBUGGING_PORT } from '../src/node/debug-ports.ts';

const rootFolderPath = fileURLToPath(new URL('..', import.meta.url));
const outFolderPath = path.resolve(rootFolderPath, 'out');
const srcFolderPath = path.resolve(rootFolderPath, 'src');

const appFolderPath = resolveAppFolderPath(true);

// When running under the VS Code debugger ("Debug app" configuration), the debugger attaches to the Electron and
// daemon processes and already forwards their console output to the Debug Console: piping/tailing their output here
// as well would print every log twice.
const isRunningUnderVsCodeDebugger = process.env.VSCODE_INSPECTOR_OPTIONS !== undefined;

/** @type {import('child_process').ChildProcess | null} */
let electronProcess = null;

const devLogger = createLogger('info', {
  prefix: '[dev]',
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
  // The remote debugging port allows to attach a debugger (VS Code, chrome://inspect) to the renderer process.
  const args = [path.join(outFolderPath, 'main.js'), `--remote-debugging-port=${RENDERER_REMOTE_DEBUGGING_PORT}`];
  electronProcess = spawn(String(electronPath), args, {
    stdio: isRunningUnderVsCodeDebugger ? 'ignore' : ['ignore', 'pipe', 'pipe'],
  });
  electronProcess.stdout?.on('data', (data) => {
    process.stdout.write(data);
  });
  electronProcess.stderr?.on('data', (data) => {
    const string = data.toString().trim();
    const shouldIgnore = stderrIgnorePatterns.some((pattern) => {
      return pattern.test(string);
    });
    if (shouldIgnore) {
      return;
    }
    process.stderr.write(data);
  });
  electronProcess.on('exit', (code) => {
    devLogger.info(`Electron process exited with code : ${code}`, { timestamp: true });
    if (code === 0) {
      process.exit(0);
    }
  });
  electronProcess.on('error', (error) => {
    devLogger.error('Electron process error', { timestamp: true });
    devLogger.error(String(error), { timestamp: true });
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

/**
 * The WebSocket server runs as a detached daemon that outlives Electron, kill it on rebuild so the restarted Electron
 * process spawns a daemon running the latest code (it also releases .node files lock on Windows).
 */
function killDaemonProcess() {
  const daemonInfoFilePath = path.join(appFolderPath, 'daemon.json');
  try {
    const { pid } = fs.readJsonSync(daemonInfoFilePath);
    process.kill(pid, 'SIGTERM');
    devLogger.info(`Killed daemon process ${pid}`, { timestamp: true });
  } catch (error) {
    // There is no daemon info file or the daemon is already dead.
  }
}

function logServerLogsWarning() {
  const lines = [
    '⚠ Server logs are not visible in this terminal!',
    '',
    `The server process inspector listens on port ${SERVER_INSPECTOR_PORT}: open chrome://inspect in Chrome and click`,
    '"Open dedicated DevTools for Node" to see them.',
    `They are also written to ${path.join(appFolderPath, 'logs', 'csdm.log')}`,
  ];
  const width = Math.max(...lines.map((line) => line.length));
  const yellow = '\x1b[33m';
  const reset = '\x1b[0m';
  const box = [
    `┌─${'─'.repeat(width)}─┐`,
    ...lines.map((line) => `│ ${line.padEnd(width)} │`),
    `└─${'─'.repeat(width)}─┘`,
  ];
  process.stdout.write(`${yellow}${box.join('\n')}${reset}\n`);
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
    configFile: path.join(rootFolderPath, 'vite.config.ts'),
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

async function buildAndWatchMainProcessBundles() {
  /** @type {import('vite/rolldown').WatchOptions} */
  const commonOptions = {
    platform: 'node',
    plugins: [nativeNodeModulesPlugin],
  };
  /** @type {import('vite/rolldown').OutputOptions} */
  const commonOutputOptions = {
    format: 'cjs',
    sourcemap: true,
    codeSplitting: false,
  };

  /** @type {import('vite/rolldown').WatchOptions} */
  const webSocketServerOptions = {
    ...commonOptions,
    input: path.join(srcFolderPath, 'server/start-server.ts'),
    external: [
      'pg-native',
      '@aws-sdk/client-s3', // the unzipper module has it as a dev dependency
    ],
    transform: {
      target: `node${node}`,
      define: {
        ...commonDefine,
        'process.env.STEAM_API_KEYS': `"${process.env.STEAM_API_KEYS}"`,
      },
    },
    resolve: {
      alias: {
        // Force fdir to use the CJS version to avoid createRequire(import.meta.url) not working
        fdir: path.join(rootFolderPath, 'node_modules/fdir/dist/index.cjs'),
      },
    },
    output: {
      ...commonOutputOptions,
      file: path.join(outFolderPath, 'server.js'),
    },
  };

  /** @type {import('vite/rolldown').WatchOptions} */
  const mainProcessOptions = {
    ...commonOptions,
    input: path.join(srcFolderPath, 'electron-main/main.ts'),
    external: ['electron', 'electron/main'],
    transform: {
      target: `node${node}`,
      define: commonDefine,
    },
    plugins: [
      nativeNodeModulesPlugin,
      {
        name: 'copy-translations',
        async writeBundle() {
          const translationsFolder = path.resolve(srcFolderPath, 'electron-main', 'translations');
          const outputFolder = path.resolve(outFolderPath, 'translations');
          await fs.copy(translationsFolder, outputFolder);
        },
      },
    ],
    output: {
      ...commonOutputOptions,
      file: path.join(outFolderPath, 'main.js'),
    },
  };

  /** @type {import('vite/rolldown').WatchOptions} */
  const preloadOptions = {
    ...commonOptions,
    input: path.join(srcFolderPath, 'preload/preload.ts'),
    external: ['electron'],
    transform: {
      target: `node${node}`,
      define: commonDefine,
    },
    output: {
      ...commonOutputOptions,
      file: path.join(outFolderPath, 'preload.js'),
      sourcemap: 'inline',
    },
  };

  const watcher = watch([webSocketServerOptions, mainProcessOptions, preloadOptions]);

  /** @type {Promise<void>} */
  const initialBuild = new Promise((resolve, reject) => {
    let isInitialBuild = true;
    watcher.on('event', (event) => {
      switch (event.code) {
        case 'START':
          // Kill the Electron and daemon processes on build start to make sure they release .node files lock.
          killElectronProcess();
          killDaemonProcess();
          break;
        case 'ERROR':
          devLogger.error(String(event.error), { timestamp: true });
          if (isInitialBuild) {
            isInitialBuild = false;
            reject(event.error);
          }
          break;
        case 'END':
          if (isInitialBuild) {
            isInitialBuild = false;
            resolve();
          } else {
            restartElectron();
          }
          break;
      }
    });
  });

  await initialBuild;
}

try {
  await fs.ensureDir(outFolderPath);

  await Promise.all([buildAndWatchRendererProcessBundle(), buildAndWatchMainProcessBundles()]);
  if (!isRunningUnderVsCodeDebugger) {
    logServerLogsWarning();
  }
  startElectron();
} catch (error) {
  devLogger.error(String(error), { timestamp: true });
  process.exit(1);
}

process.on('SIGINT', () => {
  killElectronProcess();
  process.exit(0);
});
