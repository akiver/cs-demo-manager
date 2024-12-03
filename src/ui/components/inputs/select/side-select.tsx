import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { TeamNumber } from 'csdm/common/types/counter-strike';
import type { SelectOption } from '../select';
import { FilterValue } from '../../dropdown-filter/filter-value';

type Props = {
  selectedSides: TeamNumber[];
  onChange: (side: TeamNumber | undefined) => void;
};

export function SideSelect({ onChange, selectedSides }: Props) {
  const { t } = useLingui();
  const sides: SelectOption<TeamNumber>[] = [
    {
      value: TeamNumber.CT,
      label: t({
        context: 'Select team option',
        message: 'CT',
      }),
    },
    {
      value: TeamNumber.T,
      label: t({
        context: 'Select team option',
        message: 'T',
      }),
    },
  ];

  return (
    <div className="flex flex-col gap-y-8">
      <p>
        <Trans context="Filter side category">Side</Trans>
      </p>
      <div className="flex flex-wrap gap-4">
        {sides.map((side) => {
          const isSelected = selectedSides.includes(side.value);

          return (
            <FilterValue
              key={side.value}
              isSelected={isSelected}
              onClick={() => {
                onChange(isSelected ? undefined : side.value);
              }}
            >
              {side.label}
            </FilterValue>
          );
        })}
      </div>
    </div>
  );
}
