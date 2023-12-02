import type { Transaction } from 'kysely';
import type { Database } from '../schema';

export interface Migration {
  schemaVersion: number;
  run(transaction: Transaction<Database>): Promise<void>;
}
