import { sql } from 'kysely';
import { db } from './database';

export async function getDatabaseSize(): Promise<string> {
  const query = sql<{
    size: string;
  }>`select pg_size_pretty(pg_database_size(current_database())) as size`;
  const { rows } = await query.execute(db);

  return rows.length > 0 ? rows[0].size : '0 MB';
}
