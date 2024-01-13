import { NetworkError } from 'csdm/node/errors/network-error';
import { SteamApiError } from 'csdm/node/steam-web-api/steamapi-error';
import { fetchPlayerSteamIdsInMatch } from '../players/fetch-player-steam-ids-in-match';
import { buildSteamAccountsFromSteamIds } from '../steam-accounts/build-steam-accounts-from-steam-ids';
import { insertSteamAccounts } from '../steam-accounts/insert-steam-accounts';
import { fetchMatchTable } from './fetch-match-table';
import type { InsertMatchParameters } from './insert-match';
import { insertMatch } from './insert-match';
import { Game } from 'csdm/common/types/counter-strike';
import { updateDemo } from '../demos/update-demo';

export async function processMatchInsertion({ checksum, demoPath, outputFolderPath }: InsertMatchParameters) {
  await insertMatch({
    checksum,
    demoPath,
    outputFolderPath,
  });

  try {
    const steamIds = await fetchPlayerSteamIdsInMatch(checksum);
    const steamAccounts = await buildSteamAccountsFromSteamIds(steamIds);
    if (steamAccounts.length > 0) {
      await insertSteamAccounts(steamAccounts);
    }
  } catch (error) {
    if (!(error instanceof SteamApiError) && !(error instanceof NetworkError)) {
      logger.error('Error while updating players of inserted match.');
      logger.error(error);
      throw error;
    }

    logger.warn(`Communication error with the Steam API, it doesn't prevent match insertion.`);
    logger.warn(error.message);
  }

  const match = await fetchMatchTable(checksum);

  if (match.game !== Game.CSGO) {
    await updateDemo(checksum, match);
  }

  return match;
}
