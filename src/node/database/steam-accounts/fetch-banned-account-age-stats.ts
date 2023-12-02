import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';

export async function fetchBannedAccountAgeStats() {
  const result = await db
    .selectFrom('steam_accounts')
    .select([
      sql<Date | null>`CURRENT_DATE - AVG(AGE(NOW(), creation_date))`.as('average'),
      sql<Date | null>`CURRENT_DATE - percentile_cont(0.5) WITHIN GROUP (ORDER BY AGE(NOW(), creation_date))`.as(
        'median',
      ),
    ])
    .where('steam_accounts.last_ban_date', 'is not', null)
    .where('steam_accounts.creation_date', 'is not', null)
    .executeTakeFirst();

  return {
    average: result?.average?.toISOString() ?? null,
    median: result?.median?.toISOString() ?? null,
  };
}
