import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';

export async function fetchBannedAccountAgeStats(ignoreBanBeforeFirstSeen: boolean) {
  let query = db
    .selectFrom('steam_accounts')
    .select([
      sql<Date | null>`CURRENT_DATE - AVG(AGE(NOW(), creation_date))`.as('average'),
      sql<Date | null>`CURRENT_DATE - percentile_cont(0.5) WITHIN GROUP (ORDER BY AGE(NOW(), creation_date))`.as(
        'median',
      ),
    ])
    .where('steam_accounts.last_ban_date', 'is not', null)
    .where('steam_accounts.creation_date', 'is not', null)
    .leftJoin('players', 'players.steam_id', 'steam_accounts.steam_id')
    .leftJoin('matches', 'matches.checksum', 'players.match_checksum');

  if (ignoreBanBeforeFirstSeen) {
    const { ref } = db.dynamic;
    query = query.whereRef('steam_accounts.last_ban_date', '>=', ref('matches.date'));
  }

  const result = await query.executeTakeFirst();

  return {
    average: result?.average?.toISOString() ?? null,
    median: result?.median?.toISOString() ?? null,
  };
}
