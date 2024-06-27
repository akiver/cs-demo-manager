import { insertDefaultMaps } from '../maps/insert-default-maps';
import type { Migration } from './migration';

const v4: Migration = {
  schemaVersion: 4,
  run: async (transaction) => {
    await transaction.schema
      .createTable('steam_account_tags')
      .ifNotExists()
      .addColumn('steam_id', 'varchar', (col) => col.notNull())
      .addColumn('tag_id', 'int8', (col) => col.notNull())
      .addUniqueConstraint('steam_account_tags_steam_id_tag_id_unique', ['steam_id', 'tag_id'])
      .execute();

    await insertDefaultMaps(transaction);
  },
};

// eslint-disable-next-line no-restricted-syntax
export default v4;
