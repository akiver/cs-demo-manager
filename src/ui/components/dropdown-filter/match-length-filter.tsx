import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { FilterCategory } from 'csdm/ui/components/dropdown-filter/filter-category';
import { FilterValue } from 'csdm/ui/components/dropdown-filter/filter-value';
import { FilterSelection } from './filter-selection';

type Option = {
  maxRound: number;
  name: string;
};

type Props = {
  selectedMaxRounds: number[];
  onChange: (maxRounds: number[]) => void;
  hasActiveFilter: boolean;
};

export function MatchLengthFilter({ selectedMaxRounds, onChange, hasActiveFilter }: Props) {
  const { t } = useLingui();
  const options: Option[] = [
    {
      maxRound: 16,
      name: t({
        context: 'Match length',
        message: 'MR 8',
      }),
    },
    {
      maxRound: 24,
      name: t({
        context: 'Match length',
        message: 'MR 12',
      }),
    },
    {
      maxRound: 30,
      name: t({
        context: 'Match length',
        message: 'MR 15',
      }),
    },
  ];

  const onSelectAllClick = () => {
    const values = options.map((option) => option.maxRound);
    onChange(values);
  };

  const onDeselectAllClick = () => {
    onChange([]);
  };

  return (
    <FilterCategory
      name={<Trans context="Match length filter label">Length</Trans>}
      right={
        <FilterSelection
          onSelectAllClick={onSelectAllClick}
          onDeselectAllClick={onDeselectAllClick}
          hasActiveFilter={hasActiveFilter}
        />
      }
    >
      {options.map((option) => {
        const isSelected = selectedMaxRounds.includes(option.maxRound);

        const onClick = () => {
          const newSelectedMaxRounds = isSelected
            ? selectedMaxRounds.filter((maxRound) => maxRound !== option.maxRound)
            : [...selectedMaxRounds, option.maxRound];

          onChange(newSelectedMaxRounds);
        };
        return (
          <FilterValue key={option.maxRound} isSelected={isSelected} onClick={onClick}>
            <span>{option.name}</span>
          </FilterValue>
        );
      })}
    </FilterCategory>
  );
}
