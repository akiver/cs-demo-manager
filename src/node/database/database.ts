import { types, Pool } from 'pg';
import type { KyselyConfig, LogEvent, Logger } from 'kysely';
import { Kysely, PostgresDialect } from 'kysely';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import type { Database } from './schema';

export let db: Kysely<Database>;

let connectedSettings: DatabaseSettings | undefined;
let ingestionPool: Pool | undefined;

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

  connectedSettings = settings;
  db = new Kysely<Database>(config);
}

// The connection settings the app is currently connected with.
// They are not always the ones stored in the settings file: when the embedded PostgreSQL mode is
// enabled, the port and the password are owned by the embedded cluster, not by the user.
// Never read settings.database to build a connection, use this function instead.
function getConnectedDatabaseSettings(): DatabaseSettings {
  if (connectedSettings === undefined) {
    throw new Error('The database is not connected');
  }

  return connectedSettings;
}

// Dedicated pool for match insertion.
// It's separated from the Kysely pool because a match insertion sends dozens of concurrent COPY
// commands (see insert-match.ts) and each of them holds its connection until the whole CSV file has
// been streamed. Sharing the Kysely pool would starve the app queries and, worse, the queued
// acquisitions would be rejected by its connectionTimeoutMillis, which also applies to the time
// spent waiting in the pool queue.
export function getIngestionPool(): Pool {
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
    });
  }

  return ingestionPool;
}

export async function destroyDatabaseConnection() {
  const pool = ingestionPool;
  ingestionPool = undefined;
  connectedSettings = undefined;

  await Promise.all([db?.destroy(), pool?.end()]);
}
