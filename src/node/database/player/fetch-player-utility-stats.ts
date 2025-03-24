import { type FetchPlayerFilters } from './fetch-player-filters';
import { fetchPlayersUtilityStats, type PlayerUtilityStats } from '../players/fetch-players-utility-stats';

export async function fetchPlayerUtilityStats(
  steamId: string,
  filters: FetchPlayerFilters,
): Promise<PlayerUtilityStats> {
  const stats = await fetchPlayersUtilityStats([steamId], filters);
  if (stats.length === 0) {
    return {
      steamId,
      averageBlindTime: 0,
      averageEnemiesFlashed: 0,
      averageHeGrenadeDamage: 0,
      averageSmokesThrownPerMatch: 0,
    };
  }

  return stats[0];
}
