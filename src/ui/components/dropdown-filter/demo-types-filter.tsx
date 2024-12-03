import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { FilterCategory } from 'csdm/ui/components/dropdown-filter/filter-category';
import { FilterValue } from 'csdm/ui/components/dropdown-filter/filter-value';
import { FilterSelection } from './filter-selection';
import { DemoType } from 'csdm/common/types/counter-strike';

type Option = {
  type: DemoType;
  name: string;
};

type Props = {
  selectedTypes: DemoType[];
  onChange: (types: DemoType[]) => void;
  hasActiveFilter: boolean;
};

export function DemoTypesFilter({ selectedTypes, onChange, hasActiveFilter }: Props) {
  const { t } = useLingui();
  const options: Option[] = [
    {
      type: DemoType.GOTV,
      name: t({
        context: 'Demo type',
        message: 'GOTV',
      }),
    },
    {
      type: DemoType.POV,
      name: t({
        context: 'Demo type',
        message: 'POV',
      }),
    },
  ];

  const onSelectAllClick = () => {
    const values = options.map((option) => option.type);
    onChange(values);
  };

  const onDeselectAllClick = () => {
    onChange([]);
  };

  return (
    <FilterCategory
      name={<Trans context="Demo type filter label">Demo types</Trans>}
      right={
        <FilterSelection
          onSelectAllClick={onSelectAllClick}
          onDeselectAllClick={onDeselectAllClick}
          hasActiveFilter={hasActiveFilter}
        />
      }
    >
      {options.map((option) => {
        const isSelected = selectedTypes.includes(option.type);

        const onClick = () => {
          const newSelectedTypes = isSelected
            ? selectedTypes.filter((type) => type !== option.type)
            : [...selectedTypes, option.type];

          onChange(newSelectedTypes);
        };
        return (
          <FilterValue key={option.type} isSelected={isSelected} onClick={onClick}>
            <span>{option.name}</span>
          </FilterValue>
        );
      })}
    </FilterCategory>
  );
}
