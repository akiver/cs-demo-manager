import net from 'node:net';

function isPortFree(port: number) {
  return new Promise<boolean>((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once('error', () => {
      resolve(false);
    });
    server.listen({ port, host: '127.0.0.1' }, () => {
      server.close(() => {
        resolve(true);
      });
    });
  });
}

function resolveFreePort() {
  return new Promise<number>((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once('error', reject);
    // Passing port 0 lets the OS assign an available port outside any reserved range.
    server.listen({ port: 0, host: '127.0.0.1' }, () => {
      const address = server.address();
      if (address === null || typeof address === 'string') {
        server.close();

        return reject(new Error('Unable to read the resolved port'));
      }

      const { port } = address;
      server.close(() => {
        resolve(port);
      });
    });
  });
}

/**
 * ! The default PostgreSQL port is never used: the user may already run a PostgreSQL instance on it
 * and the embedded cluster must not interfere with it.
 */
export async function resolveClusterPort(previousPort: number | undefined): Promise<number> {
  if (previousPort !== undefined && (await isPortFree(previousPort))) {
    return previousPort;
  }

  return resolveFreePort();
}
