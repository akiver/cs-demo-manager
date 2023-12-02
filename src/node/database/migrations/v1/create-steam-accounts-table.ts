import { sql } from 'kysely';
import type { Migration } from '../migration';

const createSteamAccountsTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('steam_accounts')
      .ifNotExists()
      .addColumn('steam_id', 'varchar', (col) => col.primaryKey().notNull())
      .addColumn('name', 'varchar', (col) => col.notNull())
      .addColumn('avatar', 'varchar', (col) => col.notNull())
      .addColumn('last_ban_date', 'timestamptz')
      .addColumn('is_community_banned', 'boolean', (col) => col.notNull())
      .addColumn('has_private_profile', 'boolean', (col) => col.notNull())
      .addColumn('vac_ban_count', 'integer', (col) => col.notNull())
      .addColumn('game_ban_count', 'integer', (col) => col.notNull())
      .addColumn('economy_ban', 'varchar', (col) => col.notNull())
      .addColumn('creation_date', 'timestamptz')
      .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updated_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
      .execute();

    // Trigger to delete SteamIDs from the ignored_steam_accounts table when a row is deleted.
    const cleanupIgnoredSteamAccountsTableFunction = sql`
    CREATE OR REPLACE FUNCTION cleanup_ignored_steam_accounts_tables()
    RETURNS trigger
    LANGUAGE PLPGSQL
    AS
    $$
    BEGIN
      DELETE FROM ignored_steam_accounts WHERE steam_id = OLD.steam_id;
      RETURN OLD;
    END;
    $$`;
    await cleanupIgnoredSteamAccountsTableFunction.execute(transaction);

    const deleteTrigger = sql`
    CREATE TRIGGER steam_account_deleted
    BEFORE DELETE
    ON steam_accounts
    FOR EACH ROW
    EXECUTE PROCEDURE cleanup_ignored_steam_accounts_tables();`;
    await deleteTrigger.execute(transaction);

    const updateUpdatedAtFunction = sql`
    CREATE FUNCTION update_updated_at_steam_account()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
    AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$;
    `;
    await updateUpdatedAtFunction.execute(transaction);

    const updateTrigger = sql`
    CREATE TRIGGER update_steam_account_updated_at
    BEFORE UPDATE
    ON
        steam_accounts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_steam_account();`;
    await updateTrigger.execute(transaction);

    await transaction.schema
      .createView('player_ban_per_match')
      .orReplace()
      .as(
        transaction
          .with('match_steam_ids_with_date', (qb) => {
            return qb
              .selectFrom('matches')
              .select(['matches.checksum', 'matches.date as match_date'])
              .leftJoin('players', 'matches.checksum', 'players.match_checksum')
              .select(['players.steam_id']);
          })
          .selectFrom('match_steam_ids_with_date')
          .select([
            'checksum as match_checksum',
            sql`SUM(CASE WHEN steam_accounts.last_ban_date IS NULL THEN 0 ELSE 1 END)`.as('player_ban_count'),
          ])
          .leftJoin('steam_accounts', 'steam_accounts.steam_id', 'match_steam_ids_with_date.steam_id')
          .whereRef('steam_accounts.last_ban_date', '>=', 'match_steam_ids_with_date.match_date')
          .where('steam_accounts.steam_id', 'not in', (qb) => {
            return qb.selectFrom('ignored_steam_accounts').select('steam_id');
          })
          .groupBy(['match_steam_ids_with_date.checksum']),
      )
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createSteamAccountsTable;
