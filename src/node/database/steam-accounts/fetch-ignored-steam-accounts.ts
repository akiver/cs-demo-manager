import { db } from 'csdm/node/database/database';
import type { IgnoredSteamAccount } from '../../../common/types/ignored-steam-account';

export async function fetchIgnoredSteamAccounts(steamIds?: string[]): Promise<IgnoredSteamAccount[]> {
  let query = db
    .selectFrom('ignored_steam_accounts')
    .select(['ignored_steam_accounts.steam_id'])
    .innerJoin('steam_accounts', 'steam_accounts.steam_id', 'ignored_steam_accounts.steam_id')
    .select([
      'steam_accounts.name as name',
      'steam_accounts.avatar as avatar',
      'steam_accounts.last_ban_date as last_ban_date',
    ]);

  if (Array.isArray(steamIds) && steamIds.length > 0) {
    query = query.where('ignored_steam_accounts.steam_id', 'in', steamIds);
  }

  const rows = await query.execute();

  const ignoredAccounts = rows.map<IgnoredSteamAccount>((row) => {
    return {
      steamId: row.steam_id,
      name: row.name,
      avatar: row.avatar,
      lastBanDate: row.last_ban_date?.toISOString() ?? null,
    };
  });

  return ignoredAccounts;
}
