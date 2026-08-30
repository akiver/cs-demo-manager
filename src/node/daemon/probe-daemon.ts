import { randomUUID } from 'node:crypto';
import WebSocket from 'ws';
import { CliClientMessageName } from 'csdm/server/messages/cli-client-message-name';
import { SharedServerMessageName } from 'csdm/server/messages/shared-server-message-name';
import type { Daemon } from 'csdm/common/types/daemon';

function sendProbeRequest<Result>(port: number, messageName: CliClientMessageName): Promise<Result | null> {
  return new Promise((resolve) => {
    const socket = new WebSocket(`ws://localhost:${port}?process=probe`);
    const uuid = randomUUID();
    let settled = false;

    const finish = (status: Result | null) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeoutId);
      socket.removeAllListeners();
      socket.terminate();
      resolve(status);
    };

    const probeTimeoutMs = 2_000;
    const timeoutId = setTimeout(() => {
      finish(null);
    }, probeTimeoutMs);

    socket.on('open', () => {
      socket.send(
        JSON.stringify({
          name: messageName,
          uuid,
        }),
      );
    });
    socket.on('message', (data) => {
      try {
        // oxlint-disable-next-line typescript/no-base-to-string
        const message: { name: string; payload: Result; uuid: string } = JSON.parse(data.toString());
        if (message.uuid === uuid && message.name === SharedServerMessageName.Reply) {
          finish(message.payload);
        }
      } catch {
        finish(null);
      }
    });
    socket.on('error', () => {
      finish(null);
    });
    socket.on('close', () => {
      finish(null);
    });
  });
}

/**
 * Returns the daemon status if a CSDM daemon is listening on the given port, null otherwise.
 */
export function probeDaemon(port: number): Promise<Daemon | null> {
  return sendProbeRequest<Daemon>(port, CliClientMessageName.GetDaemonStatus);
}

/**
 * Asks the daemon listening on the given port to exit, used to replace an idle daemon running an outdated version.
 */
export async function askDaemonToShutdown(port: number) {
  await sendProbeRequest(port, CliClientMessageName.ShutdownDaemon);
}
