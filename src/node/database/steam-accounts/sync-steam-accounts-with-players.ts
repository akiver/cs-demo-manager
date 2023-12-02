import { db } from '../database';
import { buildSteamAccountsFromSteamIds } from './build-steam-accounts-from-steam-ids';
import { insertSteamAccounts } from './insert-steam-accounts';

/**
 * Sync the "players" table (data from demos analyses) with the "steam_accounts" table (data from the Steam API).
 * Steam accounts are inserted after a demo analysis but it may silently fail if the Steam API returns an error or the user is offline.
 */
export async function syncSteamAccountsWithPlayers(): Promise<string[]> {
  const missingPlayerRows = await db
    .selectFrom('players')
    .select('steam_id')
    .distinct()
    .where(({ not, exists, selectFrom }) => {
      return not(
        exists(
          selectFrom('steam_accounts')
            .select('steam_accounts.steam_id')
            .whereRef('players.steam_id', '=', 'steam_accounts.steam_id'),
        ),
      );
    })
    .execute();

  const missingSteamIds = missingPlayerRows.map((row) => row.steam_id);
  if (missingSteamIds.length === 0) {
    return [];
  }

  const steamAccounts = await buildSteamAccountsFromSteamIds(missingSteamIds);
  if (steamAccounts.length === 0) {
    return [];
  }

  await insertSteamAccounts(steamAccounts);
  const insertedSteamIds = steamAccounts.map((account) => account.steam_id);

  return insertedSteamIds;
}
