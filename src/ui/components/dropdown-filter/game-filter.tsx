import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { Game } from 'csdm/common/types/counter-strike';
import { FilterCategory } from 'csdm/ui/components/dropdown-filter/filter-category';
import { FilterValue } from 'csdm/ui/components/dropdown-filter/filter-value';
import { FilterSelection } from './filter-selection';
import { useGameOptions } from 'csdm/ui/hooks/use-game-options';

type Props = {
  selectedGames: Game[];
  onChange: (games: Game[]) => void;
  hasActiveFilter: boolean;
};

export function GameFilter({ selectedGames, onChange, hasActiveFilter }: Props) {
  const options = useGameOptions();

  const onSelectAllClick = () => {
    const values = options.map((option) => option.value);
    onChange(values);
  };

  const onDeselectAllClick = () => {
    onChange([]);
  };

  return (
    <FilterCategory
      name={<Trans context="Games filter label">Games</Trans>}
      right={
        <FilterSelection
          onSelectAllClick={onSelectAllClick}
          onDeselectAllClick={onDeselectAllClick}
          hasActiveFilter={hasActiveFilter}
        />
      }
    >
      {options.map((option) => {
        const isSelected = selectedGames.includes(option.value);

        const onClick = () => {
          const newSelectedGames = isSelected
            ? selectedGames.filter((game) => game !== option.value)
            : [...selectedGames, option.value];

          onChange(newSelectedGames);
        };
        return (
          <FilterValue key={option.value} isSelected={isSelected} onClick={onClick}>
            <span>{option.label}</span>
          </FilterValue>
        );
      })}
    </FilterCategory>
  );
}
