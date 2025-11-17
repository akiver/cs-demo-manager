import type { Game } from 'csdm/common/types/counter-strike';
import { useMaps } from './use-maps';

export function useGetGameMaps() {
  const maps = useMaps();

  return (game: Game) => {
    return maps.filter((map) => map.game === game);
  };
}

export function useGameMaps(game: Game) {
  const getGameMaps = useGetGameMaps();

  return getGameMaps(game);
}
