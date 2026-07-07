import { fetchPlayerGrenadesStats } from 'csdm/node/database/player/fetch-player-grenades-stats';
import type { MatchFilters } from 'csdm/node/database/match/apply-match-filters';
import { handleError } from '../../handle-error';

export type FetchPlayerGrenadesStatsPayload = MatchFilters & {
  steamId: string;
};

export async function fetchPlayerGrenadesStatsHandler(payload: FetchPlayerGrenadesStatsPayload) {
  try {
    const stats = await fetchPlayerGrenadesStats(payload.steamId, payload);

    return stats;
  } catch (error) {
    handleError(error, `Error while fetching player grenades stats with steamID ${payload.steamId}`);
  }
}
