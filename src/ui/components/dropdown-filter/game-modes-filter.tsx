import React from 'react';
import { Trans } from '@lingui/react/macro';
import { GameMode } from 'csdm/common/types/counter-strike';
import { FilterCategory } from 'csdm/ui/components/dropdown-filter/filter-category';
import { FilterValue } from 'csdm/ui/components/dropdown-filter/filter-value';
import { FilterSelection } from 'csdm/ui/components/dropdown-filter/filter-selection';
import { useGetGameModeTranslation } from 'csdm/ui/hooks/use-get-game-mode-translation';

type Option = {
  id: GameMode;
  name: string;
};

function useGameModes(): Option[] {
  const getGameModeTranslation = useGetGameModeTranslation();

  return [
    {
      id: GameMode.Premier,
      name: getGameModeTranslation(GameMode.Premier),
    },
    {
      id: GameMode.Competitive,
      name: getGameModeTranslation(GameMode.Competitive),
    },
    {
      id: GameMode.Scrimmage5V5,
      name: getGameModeTranslation(GameMode.Scrimmage5V5),
    },
    {
      id: GameMode.Scrimmage2V2,
      name: getGameModeTranslation(GameMode.Scrimmage2V2),
    },
    {
      id: GameMode.Casual,
      name: getGameModeTranslation(GameMode.Casual),
    },
  ];
}

type Props = {
  selectedGameModes: GameMode[];
  onChange: (modes: GameMode[]) => void;
  hasActiveFilter: boolean;
};

export function GameModesFilter({ selectedGameModes, onChange, hasActiveFilter }: Props) {
  const modes = useGameModes();

  const onSelectAllClick = () => {
    const values = modes.map((mode) => mode.id);
    onChange(values);
  };

  const onDeselectAllClick = () => {
    onChange([]);
  };

  return (
    <FilterCategory
      name={<Trans context="Game modes filter label">Modes</Trans>}
      right={
        <FilterSelection
          onSelectAllClick={onSelectAllClick}
          onDeselectAllClick={onDeselectAllClick}
          hasActiveFilter={hasActiveFilter}
        />
      }
    >
      {modes.map((mode) => {
        const isSelected = selectedGameModes.includes(mode.id);

        const onClick = () => {
          const newSelectedGameModes = isSelected
            ? selectedGameModes.filter((id) => id !== mode.id)
            : [...selectedGameModes, mode.id];

          onChange(newSelectedGameModes);
        };
        return (
          <FilterValue key={mode.id} isSelected={isSelected} onClick={onClick}>
            <span>{mode.name}</span>
          </FilterValue>
        );
      })}
    </FilterCategory>
  );
}
