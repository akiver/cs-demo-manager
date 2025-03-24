import { type MatchFilters } from '../match/apply-match-filters';
import type { MapStats } from 'csdm/common/types/map-stats';
import { fetchPlayersMapsStats } from '../players/fetch-players-maps-stats';

export function fetchPlayerMapsStats(steamId: string, filters?: MatchFilters): Promise<MapStats[]> {
  return fetchPlayersMapsStats([steamId], filters);
}
