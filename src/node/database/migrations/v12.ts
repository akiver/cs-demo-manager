import { sql } from 'kysely';
import type { Migration } from './migration';

const v12: Migration = {
  schemaVersion: 12,
  run: async (transaction) => {
    // This migration removes redundant columns from the matches table that are already present in the demos table.
    // The demos table is now the single source of truth for both demos and matches.

    // The "player_ban_per_match" view (created in the v1 migration) depends on the "date" column in the matches table.
    // Since we are going to remove that column, we must first recreate the view to use the "date" column from the demos table instead.
    await transaction.schema
      .createView('player_ban_per_match')
      .orReplace()
      .as(
        transaction
          .with('match_steam_ids_with_date', (qb) => {
            return qb
              .selectFrom('matches')
              .innerJoin('demos', 'demos.checksum', 'matches.checksum')
              .select(['matches.checksum', 'demos.date as match_date'])
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

    await transaction.schema
      .alterTable('matches')
      .dropColumn('name')
      .dropColumn('game')
      .dropColumn('source')
      .dropColumn('type')
      .dropColumn('date')
      .dropColumn('map_name')
      .dropColumn('tick_count')
      .dropColumn('tickrate')
      .dropColumn('framerate')
      .dropColumn('duration')
      .dropColumn('server_name')
      .dropColumn('client_name')
      .dropColumn('network_protocol')
      .dropColumn('build_number')
      .dropColumn('share_code')
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default v12;
