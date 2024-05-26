import React from 'react';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { SideSelect } from 'csdm/ui/components/inputs/select/side-select';

type Props = {
  sides: TeamNumber[];
  onChange: (sides: TeamNumber[]) => void;
};

export function HeatmapSideSelect({ sides, onChange }: Props) {
  return (
    <SideSelect
      selectedSides={sides}
      onChange={(selectedSide: TeamNumber | undefined) => {
        onChange(selectedSide === undefined ? [] : [selectedSide]);
      }}
    />
  );
}
