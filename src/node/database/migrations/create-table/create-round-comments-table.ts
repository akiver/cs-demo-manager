import type { Transaction } from 'kysely';
import type { Database } from '../../schema';

export async function createRoundCommentsTable(transaction: Transaction<Database>) {
  await transaction.schema
    .createTable('round_comments')
    .ifNotExists()
    .addColumn('match_checksum', 'varchar', (col) => col.notNull())
    .addColumn('number', 'integer', (col) => col.notNull())
    .addColumn('comment', 'text', (col) => col.notNull().defaultTo(''))
    .addPrimaryKeyConstraint('round_comments_pkey', ['match_checksum', 'number'])
    .execute();
}
