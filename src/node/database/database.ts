import { types, Pool } from 'pg';
import type { KyselyConfig, LogEvent, Logger } from 'kysely';
import { Kysely, PostgresDialect } from 'kysely';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import type { Database } from './schema';

export let db: Kysely<Database>;

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
      connectionTimeoutMillis: 3000,
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

  db = new Kysely<Database>(config);
}
