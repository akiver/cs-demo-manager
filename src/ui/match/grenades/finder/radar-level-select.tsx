import React from 'react';
import type { RadarLevel } from 'csdm/ui/maps/radar-level';
import { RadarLevelSelect } from 'csdm/ui/components/inputs/select/radar-level-select';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { useSelectedRadarLevel } from './use-selected-radar-level';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { radarLevelChanged } from './grenades-finder-actions';

export function FinderRadarLevelSelect() {
  const selectedRadarLevel = useSelectedRadarLevel();
  const match = useCurrentMatch();
  const dispatch = useDispatch();

  const onChange = (radarLevel: RadarLevel) => {
    dispatch(radarLevelChanged({ radarLevel }));
  };

  return (
    <RadarLevelSelect
      mapName={match.mapName}
      game={match.game}
      onChange={onChange}
      selectedRadarLevel={selectedRadarLevel}
    />
  );
}
