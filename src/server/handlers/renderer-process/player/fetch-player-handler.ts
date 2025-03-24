import { fetchPlayer } from 'csdm/node/database/player/fetch-player';
import type { FetchPlayerFilters } from 'csdm/node/database/player/fetch-player-filters';
import { handleError } from '../../handle-error';

export type FetchPlayerPayload = FetchPlayerFilters & {
  steamId: string;
};

export async function fetchPlayerHandler(payload: FetchPlayerPayload) {
  try {
    const player = await fetchPlayer(payload.steamId, payload);

    return player;
  } catch (error) {
    handleError(error, `Error while fetching player with steamID ${payload.steamId}`);
  }
}
