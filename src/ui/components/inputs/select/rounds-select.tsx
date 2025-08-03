import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { Round } from 'csdm/common/types/round';
import { FilterSelection } from '../../dropdown-filter/filter-selection';
import { FilterValue } from '../../dropdown-filter/filter-value';

type Props = {
  rounds: Round[];
  selectedRoundNumbers: number[];
  onChange: (roundsNumber: number[]) => void;
};

export function RoundsSelect({ rounds, onChange, selectedRoundNumbers }: Props) {
  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex items-baseline justify-between">
        <p>
          <Trans context="Filter rounds category">Rounds</Trans>
        </p>
        <div className="ml-16 mt-px">
          <FilterSelection
            onSelectAllClick={() => {
              onChange(rounds.map((round) => round.number));
            }}
            onDeselectAllClick={() => {
              onChange([]);
            }}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        {rounds.map((round) => {
          const isSelected = selectedRoundNumbers.includes(round.number);

          return (
            <FilterValue
              key={round.number}
              isSelected={isSelected}
              onClick={() => {
                onChange(
                  isSelected
                    ? selectedRoundNumbers.filter((roundNumber) => roundNumber !== round.number)
                    : [...selectedRoundNumbers, round.number],
                );
              }}
            >
              {round.number}
            </FilterValue>
          );
        })}
      </div>
    </div>
  );
}
