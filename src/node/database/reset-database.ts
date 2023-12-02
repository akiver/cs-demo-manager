import { sql } from 'kysely';
import type { Transaction } from 'kysely';
import type { Database } from './schema';

export async function resetDatabase(transaction: Transaction<Database>) {
  await sql`DROP SCHEMA public CASCADE`.execute(transaction);
  await sql`CREATE SCHEMA public`.execute(transaction);
  await sql`GRANT ALL ON SCHEMA public TO public`.execute(transaction);
}
