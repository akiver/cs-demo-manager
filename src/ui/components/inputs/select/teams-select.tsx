import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { SelectOption } from '../select';
import { FilterValue } from 'csdm/ui/components/dropdown-filter/filter-value';
import { uniqueArray } from 'csdm/common/array/unique-array';

type Props = {
  teamNameA: string;
  teamNameB: string;
  onChange: (teamName: string | undefined) => void;
  selectedTeamNames: string[];
};

export function TeamsSelect({ teamNameA, teamNameB, onChange, selectedTeamNames }: Props) {
  const teamNames = uniqueArray([teamNameA, teamNameB]);
  const options: SelectOption[] = teamNames.map((teamName) => {
    return {
      label: teamName,
      value: teamName,
    };
  });

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
