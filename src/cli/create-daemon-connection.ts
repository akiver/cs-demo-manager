import path from 'node:path';
import type { SpawnDaemonOptions } from 'csdm/node/daemon/attach-or-spawn-daemon';
import { attachOrSpawnDaemon } from 'csdm/node/daemon/attach-or-spawn-daemon';
import { CliWebSocketClient } from './web-socket/cli-web-socket-client';
import { output } from './output';

/**
 * Connects to the WebSocket server daemon, spawning it first if it's not running.
 * The server.js bundle lives next to the cli.js file being executed, both in development (out folder) and in
 * production (app.asar). In production process.execPath is the Electron binary already running this file with
 * ELECTRON_RUN_AS_NODE, in CLI development mode it's the Node.js binary.
 */
export async function createDaemonConnection(): Promise<CliWebSocketClient> {
  const options: SpawnDaemonOptions = {
    serverBundlePath: path.join(path.dirname(process.argv[1]), 'server.js'),
    execPath: process.execPath,
    runAsNode: true,
    enableInspector: IS_DEV,
    onStep: (message) => {
      output.debug(message);
    },
  };

  const port = await attachOrSpawnDaemon(options);

  try {
    const client = await CliWebSocketClient.connect(port);
    output.debug(`Connected to the daemon on port ${port}`);
    return client;
  } catch {
    output.debug(`Failed to connect to the daemon on port ${port}, retrying`);
    // The daemon may exit between the discovery probe and this connection, typically when its idle exit fires in that
    // window (probe sockets don't count as clients). Retry once: the dead daemon is detected as stale and a fresh one
    // is spawned.
    const newPort = await attachOrSpawnDaemon(options);
    const client = await CliWebSocketClient.connect(newPort);
    output.debug(`Connected to the daemon on port ${newPort}`);
    return client;
  }
}
