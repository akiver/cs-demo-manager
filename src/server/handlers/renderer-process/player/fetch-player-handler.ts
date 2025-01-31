import { fetchPlayer } from 'csdm/node/database/player/fetch-player';
import type { FetchPlayerFilters } from 'csdm/node/database/player/fetch-player-filters';
import { handleError } from '../../handle-error';

export async function fetchPlayerHandler(payload: FetchPlayerFilters) {
  try {
    const player = await fetchPlayer(payload);

    return player;
  } catch (error) {
    handleError(error, `Error while fetching player with steamID ${payload.steamId}`);
  }
}
