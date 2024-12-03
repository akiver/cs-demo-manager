import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { DemoSource } from 'csdm/common/types/counter-strike';
import { useDemoSources } from 'csdm/ui/demos/use-demo-sources';
import { FilterCategory } from 'csdm/ui/components/dropdown-filter/filter-category';
import { FilterValue } from 'csdm/ui/components/dropdown-filter/filter-value';
import { FilterSelection } from 'csdm/ui/components/dropdown-filter/filter-selection';

type Props = {
  selectedSources: DemoSource[];
  onChange: (sources: DemoSource[]) => void;
  hasActiveFilter: boolean;
};

export function SourcesFilter({ selectedSources, onChange, hasActiveFilter }: Props) {
  const sources = useDemoSources();

  const onSelectAllClick = () => {
    const allSources = sources.map((source) => source.value);
    onChange(allSources);
  };

  const onDeselectAllClick = () => {
    onChange([]);
  };

  return (
    <FilterCategory
      name={<Trans context="Demo source filter label">Sources</Trans>}
      right={
        <FilterSelection
          hasActiveFilter={hasActiveFilter}
          onSelectAllClick={onSelectAllClick}
          onDeselectAllClick={onDeselectAllClick}
        />
      }
    >
      {sources.map((source) => {
        const isSelected = selectedSources.includes(source.value);

        const onClick = () => {
          const newSelectedSources = isSelected
            ? selectedSources.filter((sourceName) => sourceName !== source.value)
            : [...selectedSources, source.value];
          onChange(newSelectedSources);
        };
        return (
          <FilterValue isSelected={isSelected} key={source.value} onClick={onClick}>
            <span>{source.name}</span>
          </FilterValue>
        );
      })}
    </FilterCategory>
  );
}
