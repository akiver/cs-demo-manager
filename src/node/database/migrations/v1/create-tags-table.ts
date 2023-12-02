import { sql } from 'kysely';
import type { Migration } from '../migration';
import type { InsertableTag } from 'csdm/node/database/tags/tag-table';

const createTagsTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    const defaultTags: InsertableTag[] = [
      {
        name: 'To watch',
        color: '#f29423',
      },
      {
        name: 'Watched',
        color: '#33ab84',
      },
    ];

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

    await transaction
      .insertInto('tags')
      .values(defaultTags)
      .onConflict((oc) => oc.column('name').doNothing())
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createTagsTable;
