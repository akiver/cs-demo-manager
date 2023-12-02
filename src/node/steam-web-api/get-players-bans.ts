import type { EconomyBan } from './steam-constants';
import { MAX_STEAM_IDS_PER_REQUEST } from './steam-constants';
import { getSteamApiKey } from './get-steam-api-key';
import { SteamApiForbiddenError } from './steam-api-forbidden-error';
import { SteamApiError } from './steamapi-error';
import { SteamTooMayRequests } from './steam-too-many-requests';
import { sleep } from 'csdm/common/sleep';

type PlayerBan = {
  CommunityBanned: boolean;
  DaysSinceLastBan: number;
  EconomyBan: EconomyBan;
  NumberOfGameBans: number;
  NumberOfVACBans: number;
  SteamId: string;
};

type PlayerBansResponse = {
  // The Steam WEB API returns null if a Steam account has been deleted
  players: Array<PlayerBan | null>;
};

export async function getUsersBan(steamIds: string[]): Promise<PlayerBan[]> {
  const bans: PlayerBan[] = [];
  let promises: Promise<void>[] = [];
  const steamApiKey = await getSteamApiKey();

  const maxParallelRequestCount = 10;
  const requestToMakeCount = Math.ceil(steamIds.length / MAX_STEAM_IDS_PER_REQUEST);
  let requestCount = 0;
  for (let i = 0; i < steamIds.length; i += MAX_STEAM_IDS_PER_REQUEST) {
    const ids = steamIds.slice(i, i + MAX_STEAM_IDS_PER_REQUEST).join(',');
    promises.push(
      (async () => {
        const response = await fetch(
          `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${steamApiKey}&steamids=${ids}`,
        );
        if (response.status === 403) {
          throw new SteamApiForbiddenError();
        }
        if (response.status === 429) {
          throw new SteamTooMayRequests();
        }
        if (response.status !== 200) {
          throw new SteamApiError();
        }
        const { players }: PlayerBansResponse = await response.json();
        const validPlayers = players.filter((player) => player !== null) as PlayerBan[];
        bans.push(...validPlayers);
      })(),
    );

    requestCount++;
    // Limit the number of parallel requests and wait a bit before each batch to avoid a possible HTTP 429 error.
    const shouldWaitPromises = promises.length === maxParallelRequestCount || requestCount === requestToMakeCount;
    if (shouldWaitPromises) {
      await Promise.all(promises);
      promises = [];
      const shouldSleep = requestCount !== requestToMakeCount;
      if (shouldSleep) {
        await sleep(2000);
      }
    }
  }

  return bans;
}
