import { Game } from 'csdm/common/types/counter-strike';
import { useMapsState } from './use-maps-state';
import type { Map } from 'csdm/common/types/map';

export function useGetMapThumbnailSrc() {
  const { entities: maps, cacheTimestamp } = useMapsState();

  return (name: string, game?: Game) => {
    const possibleMaps = maps.filter((map) => map.name === name);

    let map: Map | undefined;
    switch (game) {
      case Game.CSGO:
        map = possibleMaps.find((map) => map.game === game);
        break;
      case Game.CS2:
      case Game.CS2LT:
      default:
        // When the game is not specified we try to find the CS2 map first since it's the most recent game
        map = possibleMaps.find((map) => map.game === Game.CS2 || map.game === Game.CS2LT);
        break;
    }

    if (!map && possibleMaps.length > 0) {
      map = possibleMaps[0];
    }

    const thumbnailFilePath = map?.thumbnailFilePath ?? window.csdm.unknownMapThumbnailFilePath;

    return `file://${thumbnailFilePath}?timestamp=${cacheTimestamp}`;
  };
}
