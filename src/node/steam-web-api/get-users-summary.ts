import { MAX_STEAM_IDS_PER_REQUEST } from './steam-constants';
import { getSteamApiKey } from './get-steam-api-key';
import { SteamApiForbiddenError } from './steam-api-forbidden-error';
import { SteamApiError } from './steamapi-error';
import { SteamTooMayRequests } from './steam-too-many-requests';
import { sleep } from 'csdm/common/sleep';

type PlayerSummary = {
  steamid: string;
  communityvisibilitystate: number; // 1 or 2 - private, 3 - public
  profilestate: number;
  personaname: string;
  lastlogoff: number;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate: number;
  realname?: string;
  primaryclanid: string;
  timecreated?: number; // Not present if the user's profile is private
  personastateflags: number;
  loccountrycode: string;
  commentpermission?: number;
};

type SteamPlayerSummaryResponse = {
  response: {
    players: PlayerSummary[];
  };
};

// https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerSummaries_.28v0002.29
export async function getUsersSummary(steamIds: string[]): Promise<PlayerSummary[]> {
  const players: PlayerSummary[] = [];
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
          `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamApiKey}&steamids=${ids}`,
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
        const { response: data }: SteamPlayerSummaryResponse = await response.json();
        const validPlayers = data.players.filter((player) => player !== null);
        players.push(...validPlayers);
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

  return players;
}
