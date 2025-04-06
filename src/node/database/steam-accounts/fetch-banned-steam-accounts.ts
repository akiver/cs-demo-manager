import { db } from 'csdm/node/database/database';
import type { BannedSteamAccount } from 'csdm/common/types/banned-steam-account';

export async function fetchBannedSteamAccounts(ignoreBanBeforeFirstSeen: boolean) {
  const { ref } = db.dynamic;
  let query = db
    .selectFrom('steam_accounts')
    .select(['steam_accounts.steam_id', 'steam_accounts.avatar', 'steam_accounts.name', 'steam_accounts.last_ban_date'])
    .distinctOn('steam_accounts.steam_id')
    .distinctOn('steam_accounts.last_ban_date')
    .where('steam_accounts.last_ban_date', 'is not', null)
    .where('steam_accounts.steam_id', 'not in', (qb) => {
      return qb.selectFrom('ignored_steam_accounts').select('ignored_steam_accounts.steam_id');
    })
    .leftJoin('players', 'players.steam_id', 'steam_accounts.steam_id')
    .select('players.rank')
    .leftJoin('matches', 'matches.checksum', 'players.match_checksum')
    .select('matches.date as match_date')
    .orderBy('steam_accounts.last_ban_date', 'desc')
    .orderBy('steam_accounts.steam_id', 'asc')
    .orderBy('matches.date', 'desc');

  if (ignoreBanBeforeFirstSeen) {
    query = query.whereRef('steam_accounts.last_ban_date', '>=', ref('matches.date'));
  }

  const rows = await query.execute();
  const bannedAccounts = rows.map<BannedSteamAccount>((row) => {
    return {
      steamId: row.steam_id,
      name: row.name,
      avatar: row.avatar,
      lastBanDate: row.last_ban_date?.toISOString() ?? '',
      rank: row.rank ?? 0,
    };
  });

  return bannedAccounts;
}
