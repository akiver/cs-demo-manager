import { sql } from 'kysely';
import { db } from './database';

export async function getPostgreSqlVersion(): Promise<string> {
  const query = sql<{ server_version: string }>`SHOW server_version`;
  const { rows } = await query.execute(db);

  return rows[0].server_version;
}
