import path from 'node:path';
import { attachOrSpawnDaemon } from 'csdm/node/daemon/attach-or-spawn-daemon';
import { CliWebSocketClient } from './web-socket/cli-web-socket-client';

/**
 * Connects to the WebSocket server daemon, spawning it first if it's not running.
 * The server.js bundle lives next to the cli.js file being executed, both in development (out folder) and in
 * production (app.asar). In production process.execPath is the Electron binary already running this file with
 * ELECTRON_RUN_AS_NODE, in CLI development mode it's the Node.js binary.
 */
export async function createDaemonConnection(): Promise<CliWebSocketClient> {
  const port = await attachOrSpawnDaemon({
    serverBundlePath: path.join(path.dirname(process.argv[1]), 'server.js'),
    execPath: process.execPath,
    runAsNode: true,
  });

  return CliWebSocketClient.connect(port);
}
