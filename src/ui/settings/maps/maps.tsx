import React from 'react';
import { useMaps } from 'csdm/ui/maps/use-maps';
import { MapEntry } from './map-entry';
import type { Game } from 'csdm/common/types/counter-strike';

type Props = {
  game: Game;
};

export function Maps({ game }: Props) {
  const maps = useMaps();
  const gameMaps = maps.filter((map) => map.game === game);

  return (
    <div className="flex flex-wrap gap-8">
      {gameMaps.map((map) => (
        <MapEntry key={map.id} map={map} />
      ))}
    </div>
  );
}
