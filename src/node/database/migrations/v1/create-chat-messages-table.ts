import type { Migration } from '../migration';

const createChatMessagesTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('chat_messages')
      .ifNotExists()
      .addColumn('id', 'bigserial', (col) => col.primaryKey().notNull())
      .addColumn('match_checksum', 'varchar', (col) => col.notNull())
      .addForeignKeyConstraint('chat_messages_match_checksum_fk', ['match_checksum'], 'matches', ['checksum'], (cb) =>
        cb.onDelete('cascade'),
      )
      .addColumn('round_number', 'integer', (col) => col.notNull())
      .addColumn('tick', 'integer', (col) => col.notNull())
      .addColumn('frame', 'integer', (col) => col.notNull())
      .addColumn('message', 'varchar', (col) => col.notNull().defaultTo(''))
      .addColumn('sender_steam_id', 'varchar', (col) => col.notNull())
      .addColumn('sender_name', 'varchar', (col) => col.notNull())
      .addColumn('sender_is_alive', 'boolean', (col) => col.notNull())
      .addColumn('sender_side', 'int2', (col) => col.notNull())
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createChatMessagesTable;
