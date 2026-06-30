import net from 'node:net';
import { DEFAULT_WEB_SOCKET_SERVER_PORT } from 'csdm/server/port';

function getServerPort(server: net.Server): number {
  const address = server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('Unable to read the resolved server port');
  }

  return address.port;
}

// Tries to listen on the given port the same way the WebSocket server does.
function listen(port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once('error', reject);
    server.listen({ port }, () => {
      const resolvedPort = getServerPort(server);
      server.close(() => {
        resolve(resolvedPort);
      });
    });
  });
}

export async function resolveWebSocketServerPort(): Promise<number> {
  try {
    return await listen(DEFAULT_WEB_SOCKET_SERVER_PORT);
  } catch (error) {
    logger.warn(
      `The default WebSocket server port ${DEFAULT_WEB_SOCKET_SERVER_PORT} is unavailable, resolving a free port`,
    );
    logger.warn(error);

    try {
      // Passing port 0 lets the OS assign an available port outside any reserved range.
      return await listen(0);
    } catch (fallbackError) {
      logger.error('Unable to resolve a free WebSocket server port, falling back to the default port');
      logger.error(fallbackError);

      return DEFAULT_WEB_SOCKET_SERVER_PORT;
    }
  }
}
