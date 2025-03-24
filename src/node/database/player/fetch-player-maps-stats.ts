import { type FetchPlayerFilters } from './fetch-player-filters';
import type { MapStats } from 'csdm/common/types/map-stats';
import { fetchPlayersMapsStats } from '../players/fetch-players-maps-stats';

export function fetchPlayerMapsStats(steamId: string, filters: FetchPlayerFilters): Promise<MapStats[]> {
  return fetchPlayersMapsStats([steamId], filters);
}
