import React from 'react';
import { RoundsSelect } from 'csdm/ui/components/inputs/select/rounds-select';
import { useCurrentMatch } from '../use-current-match';
import { useHeatmapContext } from './heatmap-context';

export function HeatmapRoundsSelect() {
  const match = useCurrentMatch();
  const { rounds, fetchPointsAndDraw } = useHeatmapContext();

  const onChange = (rounds: number[]) => {
    fetchPointsAndDraw({ rounds });
  };

  return <RoundsSelect onChange={onChange} rounds={match.rounds} selectedRoundNumbers={rounds} />;
}
