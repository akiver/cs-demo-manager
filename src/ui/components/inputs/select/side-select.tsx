import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { TeamNumber } from 'csdm/common/types/counter-strike';
import type { SelectOption } from '../select';
import { FilterValue } from '../../dropdown-filter/filter-value';

type Props = {
  selectedSides: TeamNumber[];
  onChange: (side: TeamNumber | undefined) => void;
  direction?: 'vertical' | 'horizontal';
};

export function SideSelect({ onChange, selectedSides, direction = 'vertical' }: Props) {
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
    <div className={`flex gap-8 ${direction === 'vertical' ? 'flex-col' : 'flex-row'}`}>
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
