import { fetchPlayerProfile } from 'csdm/node/database/player/fetch-player-profile';
import type { MatchFilters } from 'csdm/node/database/match/apply-match-filters';
import { handleError } from '../../handle-error';

export type FetchPlayerPayload = MatchFilters & {
  steamId: string;
};

export async function fetchPlayerHandler(payload: FetchPlayerPayload) {
  try {
    const player = await fetchPlayerProfile(payload.steamId, payload);

    return player;
  } catch (error) {
    handleError(error, `Error while fetching player with steamID ${payload.steamId}`);
  }
}
