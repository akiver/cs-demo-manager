import React from 'react';
import { Trans, msg } from '@lingui/macro';
import { FilterCategory } from 'csdm/ui/components/dropdown-filter/filter-category';
import { BanFilter } from 'csdm/common/types/ban-filter';
import { FilterValue } from 'csdm/ui/components/dropdown-filter/filter-value';
import { useI18n } from 'csdm/ui/hooks/use-i18n';
import { FilterSelection } from 'csdm/ui/components/dropdown-filter/filter-selection';

function useBanOptions() {
  const _ = useI18n();

  return [
    {
      id: BanFilter.None,
      label: _(
        msg({
          context: 'Select option Steam ban status',
          message: 'None',
        }),
      ),
    },
    {
      id: BanFilter.VacBanned,
      label: _(
        msg({
          context: 'Select option Steam ban status',
          message: 'VAC banned',
        }),
      ),
    },
    {
      id: BanFilter.GameBanned,
      label: _(
        msg({
          context: 'Select option Steam ban status',
          message: 'Game banned',
        }),
      ),
    },
    {
      id: BanFilter.CommunityBanned,
      label: _(
        msg({
          context: 'Select option Steam ban status',
          message: 'Community banned',
        }),
      ),
    },
  ];
}

type Props = {
  selectedBans: BanFilter[];
  onChange: (bans: BanFilter[]) => void;
  hasActiveFilter: boolean;
};

export function BansFilter({ selectedBans, onChange, hasActiveFilter }: Props) {
  const options = useBanOptions();

  const onSelectAllClick = () => {
    const ids = options.map((option) => option.id);
    onChange(ids);
  };

  const onDeselectAllClick = () => {
    onChange([]);
  };

  return (
    <FilterCategory
      name={<Trans context="Ban filter title">Bans</Trans>}
      right={
        <FilterSelection
          onSelectAllClick={onSelectAllClick}
          onDeselectAllClick={onDeselectAllClick}
          hasActiveFilter={hasActiveFilter}
        />
      }
    >
      {options.map((option) => {
        const isSelected = selectedBans.includes(option.id);

        const onClick = () => {
          const newSelectedBans = isSelected
            ? selectedBans.filter((id) => id !== option.id)
            : [...selectedBans, option.id];

          onChange(newSelectedBans);
        };
        return (
          <FilterValue key={option.id} isSelected={isSelected} onClick={onClick}>
            <span>{option.label}</span>
          </FilterValue>
        );
      })}
    </FilterCategory>
  );
}
