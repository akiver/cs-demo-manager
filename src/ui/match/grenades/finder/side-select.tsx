import React from 'react';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { SideSelect } from 'csdm/ui/components/inputs/select/side-select';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { sidesChanged } from './grenades-finder-actions';
import { useSelectedSides } from './use-selected-sides';

export function FinderSideSelect() {
  const selectedSides = useSelectedSides();
  const dispatch = useDispatch();

  return (
    <SideSelect
      selectedSides={selectedSides}
      onChange={(selectedSide: TeamNumber | undefined) => {
        dispatch(sidesChanged({ sides: selectedSide === undefined ? [] : [selectedSide] }));
      }}
    />
  );
}
