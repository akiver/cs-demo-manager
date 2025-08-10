import type { Map } from 'csdm/common/types/map';
import { useMaps } from 'csdm/ui/maps/use-maps';
import { useCurrentMatch } from './use-current-match';

export function useCurrentMatchMap(): Map | undefined {
  const match = useCurrentMatch();
  const maps = useMaps();

  return maps.find((map) => map.name === match.mapName && map.game === match.game);
}
