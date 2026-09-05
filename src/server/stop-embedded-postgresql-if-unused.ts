import { stopEmbeddedPostgreSql } from 'csdm/node/database/embedded/embedded-postgresql';
import { server } from 'csdm/server/server';

/**
 * Stops the embedded database server unless CLI clients may still be using it.
 * The daemon connection is the only one it knows about, CLI commands open their own with the settings the daemon
 * handed them and rely on the server staying up while they are connected.
 * A server kept running here is stopped when the daemon exits.
 */
export async function stopEmbeddedPostgreSqlIfUnused() {
  const cliClientCount = server.getCliClientCount();
  if (cliClientCount > 0) {
    logger.warn(`The embedded database server is kept running, ${cliClientCount} CLI client(s) are connected`);
    return;
  }

  await stopEmbeddedPostgreSql();
}
