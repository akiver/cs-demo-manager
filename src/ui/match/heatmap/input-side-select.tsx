import React from 'react';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { SideSelect } from 'csdm/ui/components/inputs/select/side-select';
import { useHeatmapContext } from './heatmap-context';

export function HeatmapSideSelect() {
  const { sides, fetchPointsAndDraw } = useHeatmapContext();

  return (
    <SideSelect
      selectedSides={sides}
      onChange={(selectedSide: TeamNumber | undefined) => {
        fetchPointsAndDraw({
          sides: selectedSide === undefined ? [] : [selectedSide],
        });
      }}
    />
  );
}
