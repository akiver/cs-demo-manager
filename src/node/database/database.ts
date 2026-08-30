import { types, Pool, type PoolClient } from 'pg';
import type { KyselyConfig, LogEvent, Logger } from 'kysely';
import { Kysely, PostgresDialect } from 'kysely';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import type { Database } from './schema';

export let db: Kysely<Database>;

let ingestionPool: Pool | undefined;
const ingestionClients = new Set<PoolClient>();
const pendingAcquisitions = new Set<(error: Error) => void>();
const databaseClosedError = new Error('The database connection has been closed');

// Convert int8 values that are "safe" JS integers into Numbers otherwise leave them as strings.
// Postgres returns int8 values for int8 columns but also aggregate functions (COUNT(), SUM()...).
// By default node-pg parses int8 values into strings.
// We do this conversion for the following reasons:
// - The only int8 columns in the app are used for tables PK ID and we don't do Math operations on them.
// - To not have to think about casting values into numbers when using aggregate functions, i.e.:
//   db.count('id') vs db.raw('COUNT(id)::INT')
// - Sending BigInts through WebSocket result in strings.
types.setTypeParser(types.builtins.INT8, (value) => {
  const valueAsNumber = Number(value);
  if (Number.isSafeInteger(valueAsNumber)) {
    return valueAsNumber;
  }

  return value;
});
// Cast numeric types into JS Number so SUM, AVG... will be numbers instead of strings.
types.setTypeParser(types.builtins.NUMERIC, Number);
types.setTypeParser(types.builtins.INT4, Number);
types.setTypeParser(types.builtins.INT2, Number);

export function createDatabaseConnection(settings: DatabaseSettings) {
  const dialect = new PostgresDialect({
    pool: new Pool({
      host: settings.hostname,
      port: settings.port,
      user: settings.username,
      password: settings.password,
      database: settings.database,
      connectionTimeoutMillis: 10000,
    }),
  });

  let loggerFunction: Logger;
  if (process.env.LOG_DATABASE_QUERIES) {
    loggerFunction = (event: LogEvent) => {
      logger.log(event.query.sql);
      logger.log(event.query.parameters);
      if (event.level === 'error') {
        logger.log('Failed query:');
        logger.error(event.error);
      }
    };
  } else {
    loggerFunction = (event: LogEvent) => {
      if (event.level === 'error') {
        logger.log('Failed query:');
        logger.error(event.error);
      }
    };
  }

  const config: KyselyConfig = {
    dialect,
    log: loggerFunction,
  };

  // ! The ingestion pool is built from these settings, it must not survive a reconnection to another
  // server, otherwise ingestion would keep writing to the previous one.
  // Reconnecting is not necessarily preceded by destroyDatabaseConnection(): start-minimized-mode
  // retries connectDatabase() on an interval without waiting for the previous attempt to settle.
  discardIngestionPool()?.catch((error: unknown) => {
    logger.error('Failed to close the previous ingestion pool');
    logger.error(error);
  });

  // Dedicated pool for data ingestion.
  // It's separated from the Kysely pool because an ingestion may send dozens of concurrent COPY
  // commands and each of them holds its connection until the whole CSV file has been streamed.
  // Sharing the Kysely pool would starve the app queries and, worse, the queued acquisitions would
  // be rejected by its connectionTimeoutMillis, which also applies to the time spent waiting in the
  // pool queue.
  // Created eagerly (it opens connections only on first use) so its existence tracks the connection
  // state.
  ingestionPool = new Pool({
    host: settings.hostname,
    port: settings.port,
    user: settings.username,
    password: settings.password,
    database: settings.database,
    max: 8,
    // COPY commands may take minutes, waiting for a free connection must not time out.
    connectionTimeoutMillis: 0,
    // Ingestion may write hundreds of thousands of rows that can be re-generated from their
    // source, waiting for the WAL to be flushed on each commit is not worth the cost.
    // Set on the pool rather than per COPY: it's a session setting, it would be redundant.
    options: '-c synchronous_commit=off',
  });
  db = new Kysely<Database>(config);
}

export function isDatabaseConnected() {
  return ingestionPool !== undefined;
}

function getIngestionPool(): Pool {
  if (ingestionPool === undefined) {
    throw new Error('The database is not connected');
  }

  return ingestionPool;
}

/**
 * Releases the ingestion pool and everything that depends on it, and returns the pending end().
 *
 * ! It must be the only way the pool is discarded: closing it without going through this leaves the
 * COPY commands that were using it hanging, see the two loops below.
 */
function discardIngestionPool() {
  const pool = ingestionPool;
  ingestionPool = undefined;

  // ! Waiting for the checked-out clients is not an option, an in-flight COPY may take minutes
  // and pool.end() only resolves once every client is back. Releasing them with an error destroys
  // their connection instead, which aborts the COPY server-side.
  for (const client of ingestionClients) {
    client.release(databaseClosedError);
  }
  ingestionClients.clear();

  // ! These would never settle on their own: pg-pool stops serving its pending queue as soon as
  // end() is called, so a connect() already queued at that point is neither resolved nor rejected.
  for (const reject of pendingAcquisitions) {
    reject(databaseClosedError);
  }
  pendingAcquisitions.clear();

  return pool?.end();
}

/**
 * Checked-out clients are tracked so that discarding the pool can abort the COPY commands running on
 * them, and so are the acquisitions still waiting for a connection.
 *
 * The waiting ones matter because an ingestion may send far more COPY commands than the pool size,
 * so most of them sit in the pool queue rather than holding a connection.
 */
export async function acquireIngestionClient(): Promise<PoolClient> {
  const pool = getIngestionPool();
  const client = await new Promise<PoolClient>((resolve, reject) => {
    pendingAcquisitions.add(reject);

    pool.connect().then(
      (connectedClient) => {
        if (pendingAcquisitions.delete(reject)) {
          resolve(connectedClient);
        } else {
          // discardIngestionPool() already rejected this acquisition.
          connectedClient.release(databaseClosedError);
        }
      },
      (error: unknown) => {
        pendingAcquisitions.delete(reject);
        reject(error instanceof Error ? error : databaseClosedError);
      },
    );
  });

  // The pool has been replaced between the connection being handed out and this line.
  if (pool !== ingestionPool) {
    client.release(databaseClosedError);
    throw databaseClosedError;
  }

  ingestionClients.add(client);

  return client;
}

export function releaseIngestionClient(client: PoolClient) {
  if (!ingestionClients.delete(client)) {
    return;
  }

  client.release();
}

export async function destroyDatabaseConnection() {
  await Promise.all([db?.destroy(), discardIngestionPool()]);
}
