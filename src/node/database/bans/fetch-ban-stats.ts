import { roundNumber } from 'csdm/common/math/round-number';
import type { BanStats } from 'csdm/common/types/ban-stats';
import { db } from '../database';
import { fetchMatchCount } from '../matches/fetch-match-count';
import { fetchBannedSteamAccounts } from '../steam-accounts/fetch-banned-steam-accounts';
import { fetchBannedAccountAgeStats } from '../steam-accounts/fetch-banned-account-age-stats';

async function fetchAccountCount() {
  const { count } = db.fn;
  const result = await db
    .selectFrom('players')
    .select(count<number>('players.steam_id').distinct().as('accountCount'))
    .leftJoin('ignored_steam_accounts', 'ignored_steam_accounts.steam_id', 'players.steam_id')
    .where('ignored_steam_accounts.steam_id', 'is', null)
    .executeTakeFirst();

  return result?.accountCount ?? 0;
}

export async function fetchBanStats(): Promise<BanStats> {
  const [bannedAccounts, accountCount, matchCount, age] = await Promise.all([
    fetchBannedSteamAccounts(),
    fetchAccountCount(),
    fetchMatchCount(),
    fetchBannedAccountAgeStats(),
  ]);
  const bannedAccountCount = bannedAccounts.length;
  const bannedAccountPercentage = accountCount > 0 ? roundNumber((bannedAccountCount / accountCount) * 100) : 0;
  const averageBannedAccountPerMatch = matchCount > 0 ? roundNumber(bannedAccountCount / matchCount, 1) : 0;

  return {
    bannedAccounts,
    bannedAccountCount,
    accountCount,
    bannedAccountPercentage,
    averageBannedAccountPerMatch,
    averageBannedAccountAgeInMonths: age.average,
    medianBannedAccountAgeInMonths: age.median,
  };
}
