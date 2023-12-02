import React from 'react';
import { Trans } from '@lingui/macro';
import type { SelectOption } from '../select';
import { FilterValue } from '../../dropdown-filter/filter-value';

type Props = {
  teamNameA: string;
  teamNameB: string;
  onChange: (teamName: string | undefined) => void;
  selectedTeamNames: string[];
};

export function TeamsSelect({ teamNameA, teamNameB, onChange, selectedTeamNames }: Props) {
  const options: SelectOption[] = [
    {
      label: teamNameA,
      value: teamNameA,
    },
    {
      label: teamNameB,
      value: teamNameB,
    },
  ];

  return (
    <div className="flex flex-col gap-y-8">
      <p>
        <Trans context="Filter teams name category">Teams</Trans>
      </p>
      <div className="flex flex-wrap gap-4">
        {options.map((team) => {
          const isSelected = selectedTeamNames.includes(team.value);
          return (
            <FilterValue
              isSelected={isSelected}
              onClick={() => {
                onChange(isSelected ? undefined : team.value);
              }}
              key={team.value}
            >
              {team.label}
            </FilterValue>
          );
        })}
      </div>
    </div>
  );
}
