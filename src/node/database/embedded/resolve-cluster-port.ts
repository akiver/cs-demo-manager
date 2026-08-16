import net from 'node:net';

// Resolves with the error code of the failed bind, or undefined when it succeeded.
function tryToListen(port: number) {
  return new Promise<string | undefined>((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once('error', (error: NodeJS.ErrnoException) => {
      resolve(error.code ?? 'UNKNOWN');
    });
    server.listen({ port, host: '127.0.0.1' }, () => {
      server.close(() => {
        resolve(undefined);
      });
    });
  });
}

// Whatever the reason the bind failed, the port can't be used for the cluster.
async function isPortFree(port: number) {
  return (await tryToListen(port)) === undefined;
}

/**
 * Whether something is listening on the port, which is how a running cluster is told apart from a
 * stale postmaster.pid.
 *
 * ! Only EADDRINUSE proves it. Any other failure, EACCES on a port the user is not allowed to bind
 * for example, says nothing about the cluster and must not be read as "it's running".
 */
export async function isPortInUse(port: number) {
  return (await tryToListen(port)) === 'EADDRINUSE';
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
