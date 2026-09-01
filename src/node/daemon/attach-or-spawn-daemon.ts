import { spawn } from 'node:child_process';
import { sleep } from 'csdm/common/sleep';
import { readDaemonInfoFile, deleteDaemonInfoFile, getDaemonInfoFilePath } from './daemon-info-file';
import { probeDaemon, askDaemonToShutdown } from './probe-daemon';
import pkg from '../../../package.json';
import { isProcessAlive } from '../os/is-process-alive';
import { SERVER_INSPECTOR_PORT } from 'csdm/node/debug-ports';

export type SpawnDaemonOptions = {
  // Path to the server.js bundle, it lives next to the file being executed (cli.js or main.js).
  serverBundlePath: string;
  // Binary used to run the bundle: the Electron binary in production, the Node.js binary in CLI dev mode.
  execPath: string;
  // Run the Electron binary as a plain Node.js process, it's a no-op with a real Node.js binary.
  runAsNode: boolean;
  // Expose the Node.js inspector (dev mode only) so the daemon can be debugged from chrome://inspect: console,
  // breakpoints and network requests thanks to the --experimental-network-inspection flag.
  enableInspector?: boolean;
};

async function tryAttachToRunningDaemon(): Promise<number | null> {
  const info = await readDaemonInfoFile();
  if (info === null) {
    return null;
  }

  if (!isProcessAlive(info.pid)) {
    await deleteDaemonInfoFile();
    return null;
  }

  const status = await probeDaemon(info.port);
  if (status === null) {
    await deleteDaemonInfoFile();
    return null;
  }

  if (status.version !== pkg.version) {
    if (!status.busy && status.clientCount === 0) {
      // The daemon runs an outdated version (typically after an app update), has no work in progress and no connected
      // clients: replace it. When clients are attached (e.g. the GUI that spawned it is still running), shutting it
      // down would break them, attach to it instead.
      logger.log(`Asking the daemon running version ${status.version} to exit`);
      await askDaemonToShutdown(info.port);
      const startTime = Date.now();
      const shutdownTimeoutMs = 2_000;
      const pollIntervalMs = 250;
      while (isProcessAlive(info.pid) && Date.now() - startTime < shutdownTimeoutMs) {
        await sleep(pollIntervalMs);
      }
      if (!isProcessAlive(info.pid)) {
        return null;
      }
    }

    logger.warn(`Attaching to a daemon running version ${status.version} while the app version is ${pkg.version}`);
  }

  return info.port;
}

function spawnDetachedDaemon({ serverBundlePath, execPath, runAsNode, enableInspector }: SpawnDaemonOptions) {
  logger.log(`Spawning daemon from ${serverBundlePath}`);
  const args = [serverBundlePath];
  if (enableInspector) {
    // --inspect-wait pauses the daemon until a debugger attaches, it guarantees that the DevTools network tab captures
    // requests from the very first one.
    const inspectFlag = process.env.CSDM_DAEMON_INSPECT_WAIT
      ? `--inspect-wait=${SERVER_INSPECTOR_PORT}`
      : `--inspect=${SERVER_INSPECTOR_PORT}`;
    args.unshift(inspectFlag, '--experimental-network-inspection');
    if (process.env.CSDM_DAEMON_INSPECT_WAIT) {
      logger.log(
        `The daemon is paused until a debugger attaches to port ${SERVER_INSPECTOR_PORT}: open chrome://inspect in Chrome and click "Open dedicated DevTools for Node", or attach the VS Code debugger`,
      );
    }
  }
  const child = spawn(execPath, args, {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
    env: {
      ...process.env,
      ...(runAsNode ? { ELECTRON_RUN_AS_NODE: '1' } : {}),
    },
  });
  child.unref();
}

/**
 * Waits for a daemon to be discoverable and healthy, returns the port it's listening on.
 */
async function waitForDaemonReady(): Promise<number> {
  const startTime = Date.now();
  // A daemon spawned with --inspect-wait doesn't run until a debugger attaches, leave time to open the DevTools.
  const spawnTimeoutMs = process.env.CSDM_DAEMON_INSPECT_WAIT ? 60_000 : 10_000;
  const pollIntervalMs = 250;
  while (Date.now() - startTime < spawnTimeoutMs) {
    // Re-read the daemon info file on every iteration: if several processes spawned a daemon at the same time, only
    // one keeps the port and writes the file, the others exit on their own.
    const info = await readDaemonInfoFile();
    if (info !== null) {
      const status = await probeDaemon(info.port);
      if (status !== null) {
        return info.port;
      }
    }

    await sleep(pollIntervalMs);
  }

  throw new Error(
    `The daemon didn't start within ${spawnTimeoutMs / 1000}s (no discovery file at ${getDaemonInfoFilePath()}), see the log file ${logger.getLogFilePath()} for details`,
  );
}

/**
 * Returns the port of the WebSocket server daemon, attaching to a running daemon when a healthy one is discovered
 * through the daemon info file, spawning a detached one otherwise.
 */
export async function attachOrSpawnDaemon(options: SpawnDaemonOptions): Promise<number> {
  const runningDaemonPort = await tryAttachToRunningDaemon();
  if (runningDaemonPort !== null) {
    return runningDaemonPort;
  }

  spawnDetachedDaemon(options);

  return waitForDaemonReady();
}
