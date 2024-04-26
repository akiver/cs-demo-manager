import { sql } from 'kysely';
import type { Migration } from '../migration';
import { insertDefaultTags } from 'csdm/node/database/tags/insert-default-tags';

const createTagsTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('tags')
      .ifNotExists()
      .addColumn('id', 'bigserial', (col) => col.primaryKey().notNull())
      .addColumn('name', 'varchar', (col) => col.notNull().unique())
      .addColumn('color', 'varchar', (col) => col.notNull())
      .execute();

    // Trigger to delete checksum/tag_id relationship in the table "checksum_tag" when a tag is deleted.
    const cleanupChecksumTagTable = sql`
    CREATE OR REPLACE FUNCTION delete_checksum_tag_relation()
    RETURNS trigger
    LANGUAGE PLPGSQL
    AS
    $$
    BEGIN
      DELETE FROM checksum_tags
      WHERE tag_id IN(OLD.id);
      RETURN OLD;
    END;
    $$`;
    await cleanupChecksumTagTable.execute(transaction);

    const deleteTrigger = sql`
    CREATE TRIGGER tag_deleted
    BEFORE DELETE
    ON tags
    FOR EACH ROW
    EXECUTE PROCEDURE delete_checksum_tag_relation();`;
    await deleteTrigger.execute(transaction);

    await insertDefaultTags(transaction);
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createTagsTable;
