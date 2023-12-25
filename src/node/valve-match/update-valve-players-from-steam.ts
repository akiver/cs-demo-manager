import { SteamApiError } from 'csdm/node/steam-web-api/steamapi-error';
import type { ValvePlayer } from 'csdm/common/types/valve-match';
import { buildSteamAccountsFromSteamIds } from 'csdm/node/database/steam-accounts/build-steam-accounts-from-steam-ids';
import { insertSteamAccounts } from 'csdm/node/database/steam-accounts/insert-steam-accounts';
import type { InsertableSteamAccount } from 'csdm/node/database/steam-accounts/steam-account-table';
import { fetchSteamAccounts } from 'csdm/node/database/steam-accounts/fetch-steam-accounts';

export async function updateValvePlayersFromSteam(players: ValvePlayer[]) {
  try {
    const steamIds = players.map((player) => player.steamId);
    let accounts: InsertableSteamAccount[] = await fetchSteamAccounts(steamIds);
    const needsToFetchPlayersFromSteam =
      steamIds.filter((steamId) => {
        return !accounts.some((account) => account.steam_id === steamId);
      }).length > 0;

    if (needsToFetchPlayersFromSteam) {
      accounts = await buildSteamAccountsFromSteamIds(steamIds);
      if (accounts.length === 0) {
        return;
      }

      await insertSteamAccounts(accounts);
    }

    for (const player of players) {
      const account = accounts.find((account) => account.steam_id === player.steamId);
      // ! When a Steam account has been deleted the API returns an empty object, make sure it really exists.
      if (account) {
        player.name = account.name;
        player.avatar = account.avatar;
      } else {
        player.name = 'Deleted account';
      }
    }
  } catch (error) {
    logger.error('Error while updating match info players from Steam');
    logger.error(error);
    if (!(error instanceof SteamApiError)) {
      throw error;
    }
  }
}
