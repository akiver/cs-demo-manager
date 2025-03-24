import { type FetchPlayerFilters } from './fetch-player-filters';
import { fetchPlayersRoundCountStats, type PlayerRoundCountStats } from '../players/fetch-players-round-count-stats';

export async function fetchPlayerRoundCountStats(
  steamId: string,
  filters: FetchPlayerFilters,
): Promise<PlayerRoundCountStats> {
  const rows = await fetchPlayersRoundCountStats([steamId], filters);

  if (rows.length === 0) {
    return {
      steamId,
      totalCount: 0,
      roundCountAsCt: 0,
      roundCountAsT: 0,
    };
  }

  return rows[0];
}
