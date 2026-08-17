import { types, Pool, type PoolClient } from 'pg';
import type { KyselyConfig, LogEvent, Logger } from 'kysely';
import { Kysely, PostgresDialect } from 'kysely';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import type { EmbeddedClusterSession } from 'csdm/node/database/embedded/start-cluster';
import { releaseEmbeddedClusterSession } from 'csdm/node/database/embedded/stop-cluster';
import type { Database } from './schema';

export let db: Kysely<Database>;

let connectedSettings: DatabaseSettings | undefined;
let embeddedClusterSession: EmbeddedClusterSession | undefined;
const embeddedSessionsPendingRelease = new Map<EmbeddedClusterSession, boolean>();
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

export type PreparedDatabaseConnection = {
  database: Kysely<Database>;
  settings: DatabaseSettings;
  embeddedClusterSession?: EmbeddedClusterSession;
};

export type DatabaseConnectionCleanup = {
  embeddedValidationPassword?: string;
  embeddedSessionsReleased: Promise<void>;
  resourcesDestroyed: Promise<void>;
};

function queueEmbeddedSessionRelease(session: EmbeddedClusterSession, stopIfUnused: boolean) {
  embeddedSessionsPendingRelease.set(session, (embeddedSessionsPendingRelease.get(session) ?? false) || stopIfUnused);
}

async function releasePendingEmbeddedSessions(stopIfUnusedOverride?: boolean) {
  const errors: unknown[] = [];
  for (const [session, stopIfUnused] of embeddedSessionsPendingRelease) {
    try {
      await releaseEmbeddedClusterSession(session, {
        stopIfUnused: stopIfUnusedOverride ?? stopIfUnused,
      });
      embeddedSessionsPendingRelease.delete(session);
    } catch (error) {
      errors.push(error);
    }
  }

  if (errors.length === 1) {
    throw errors[0];
  }
  if (errors.length > 1) {
    throw new AggregateError(errors, 'Failed to release embedded PostgreSQL sessions');
  }
}

async function waitForDatabaseResourceCleanup(tasks: Array<Promise<unknown> | undefined>) {
  const pendingTasks = tasks.filter((task): task is Promise<unknown> => task !== undefined);
  const results = await Promise.allSettled(pendingTasks);
  const errors = results.flatMap((result) => {
    return result.status === 'rejected' ? [result.reason] : [];
  });
  if (errors.length === 1) {
    throw errors[0];
  }
  if (errors.length > 1) {
    throw new AggregateError(errors, 'Failed to release database resources');
  }
}

export function createDatabaseConnection(
  settings: DatabaseSettings,
  embeddedSession?: EmbeddedClusterSession,
): PreparedDatabaseConnection {
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

  return {
    database: new Kysely<Database>(config),
    settings,
    embeddedClusterSession: embeddedSession,
  };
}

export async function discardPreparedDatabaseConnection(
  connection: PreparedDatabaseConnection,
  options: { stopEmbeddedIfUnused?: boolean } = {},
) {
  if (connection.embeddedClusterSession !== undefined) {
    queueEmbeddedSessionRelease(connection.embeddedClusterSession, options.stopEmbeddedIfUnused ?? false);
  }

  await waitForDatabaseResourceCleanup([connection.database.destroy(), releasePendingEmbeddedSessions()]);
}

export async function commitDatabaseConnection(
  connection: PreparedDatabaseConnection,
  options: { stopPreviousEmbeddedIfUnused: boolean },
) {
  const previousDb = db;
  const previousEmbeddedSession = embeddedClusterSession;

  if (previousEmbeddedSession !== undefined) {
    queueEmbeddedSessionRelease(previousEmbeddedSession, options.stopPreviousEmbeddedIfUnused);
  }

  // Publish the fully connected and migrated candidate before disposing the old resources. Imports
  // of `db` are live bindings, so every following query sees the candidate immediately.
  db = connection.database;
  connectedSettings = connection.settings;
  embeddedClusterSession = connection.embeddedClusterSession;

  const results = await Promise.allSettled([
    previousDb?.destroy(),
    discardIngestionPool(),
    releasePendingEmbeddedSessions(),
  ]);

  for (const result of results) {
    if (result.status === 'rejected') {
      logger.error('Failed to release a previous database resource');
      logger.error(result.reason);
    }
  }
}

// The settings the app is currently connected with.
// They are not necessarily the ones stored in the settings file: connectDatabase() also accepts the
// settings coming from the connection form, which are persisted only once the connection succeeded.
function getConnectedDatabaseSettings(): DatabaseSettings {
  if (connectedSettings === undefined) {
    throw new Error('The database is not connected');
  }

  return connectedSettings;
}

// Dedicated pool for data ingestion.
// It's separated from the Kysely pool because an ingestion may send dozens of concurrent COPY
// commands and each of them holds its connection until the whole CSV file has been streamed.
// Sharing the Kysely pool would starve the app queries and, worse, the queued acquisitions would
// be rejected by its connectionTimeoutMillis, which also applies to the time spent waiting in the
// pool queue.
function getIngestionPool(): Pool {
  if (ingestionPool === undefined) {
    const settings = getConnectedDatabaseSettings();
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

export function beginDatabaseConnectionCleanup(
  options: {
    stopEmbeddedIfUnused?: boolean;
    releasePendingEmbeddedWithoutStopping?: boolean;
  } = {},
): DatabaseConnectionCleanup {
  const database = db;
  const session = embeddedClusterSession;

  if (session !== undefined) {
    queueEmbeddedSessionRelease(session, options.stopEmbeddedIfUnused ?? false);
  }

  connectedSettings = undefined;
  embeddedClusterSession = undefined;

  return {
    embeddedValidationPassword: session?.settings.password,
    embeddedSessionsReleased: releasePendingEmbeddedSessions(
      options.releasePendingEmbeddedWithoutStopping ? false : undefined,
    ),
    resourcesDestroyed: waitForDatabaseResourceCleanup([database?.destroy(), discardIngestionPool()]),
  };
}

export async function destroyDatabaseConnection(
  options: {
    stopEmbeddedIfUnused?: boolean;
    releasePendingEmbeddedWithoutStopping?: boolean;
  } = {},
) {
  const cleanup = beginDatabaseConnectionCleanup(options);
  await waitForDatabaseResourceCleanup([cleanup.resourcesDestroyed, cleanup.embeddedSessionsReleased]);
}
