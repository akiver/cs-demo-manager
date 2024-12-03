import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { WeaponName } from 'csdm/common/types/counter-strike';
import { FilterCategory } from 'csdm/ui/components/dropdown-filter/filter-category';
import { FilterValue } from 'csdm/ui/components/dropdown-filter/filter-value';
import { FilterSelection } from 'csdm/ui/components/dropdown-filter/filter-selection';

type Props = {
  selectedWeapons: WeaponName[];
  onChange: (sources: WeaponName[]) => void;
  hasActiveFilter: boolean;
  weapons: WeaponName[];
};

export function WeaponsFilter({ weapons, selectedWeapons, onChange, hasActiveFilter }: Props) {
  const onSelectAllClick = () => {
    onChange(weapons);
  };

  const onDeselectAllClick = () => {
    onChange([]);
  };

  return (
    <FilterCategory
      name={<Trans context="Weapons filter label">Weapons</Trans>}
      right={
        <FilterSelection
          hasActiveFilter={hasActiveFilter}
          onSelectAllClick={onSelectAllClick}
          onDeselectAllClick={onDeselectAllClick}
        />
      }
    >
      {weapons.map((weapon) => {
        const isSelected = selectedWeapons.includes(weapon);

        const onClick = () => {
          const newSelectedSources = isSelected
            ? selectedWeapons.filter((weaponName) => weaponName !== weapon)
            : [...selectedWeapons, weapon];
          onChange(newSelectedSources);
        };
        return (
          <FilterValue isSelected={isSelected} key={weapon} onClick={onClick}>
            <span>{weapon}</span>
          </FilterValue>
        );
      })}
    </FilterCategory>
  );
}
