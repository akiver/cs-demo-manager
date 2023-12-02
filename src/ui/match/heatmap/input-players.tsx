import React from 'react';
import { PlayersSelect } from 'csdm/ui/components/inputs/select/players-select';
import { useCurrentMatch } from '../use-current-match';
import { useHeatmapContext } from './heatmap-context';

export function HeatmapInputPlayers() {
  const match = useCurrentMatch();
  const { steamIds, fetchPointsAndDraw } = useHeatmapContext();

  return (
    <PlayersSelect
      players={match.players}
      selectedSteamIds={steamIds}
      onChange={(steamIds: string[]) => {
        fetchPointsAndDraw({ steamIds });
      }}
    />
  );
}
