import React from 'react';
import { MapEntry } from './map-entry';
import type { Game } from 'csdm/common/types/counter-strike';
import { useGameMaps } from 'csdm/ui/maps/use-game-maps';

type Props = {
  game: Game;
};

export function Maps({ game }: Props) {
  const maps = useGameMaps(game);

  return (
    <div className="flex flex-wrap gap-8">
      {maps.map((map) => (
        <MapEntry key={map.id} map={map} />
      ))}
    </div>
  );
}
