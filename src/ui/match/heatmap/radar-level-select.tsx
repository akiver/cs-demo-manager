import React from 'react';
import { useRadarLevel } from './use-radar-level';
import { useCurrentMatch } from '../use-current-match';
import type { RadarLevel } from 'csdm/ui/maps/radar-level';
import { RadarLevelSelect } from 'csdm/ui/components/inputs/select/radar-level-select';

export function HeatmapRadarLevelSelect() {
  const { radarLevel, updateRadarLevel } = useRadarLevel();
  const match = useCurrentMatch();

  const onChange = (radarLevel: RadarLevel) => {
    updateRadarLevel(radarLevel);
  };

  return (
    <RadarLevelSelect mapName={match.mapName} game={match.game} onChange={onChange} selectedRadarLevel={radarLevel} />
  );
}
