import React from 'react';
import type { DemoSource, DemoType, Game } from 'csdm/common/types/counter-strike';
import { DropdownFilter } from 'csdm/ui/components/dropdown-filter/dropdown-filter';
import { useDemosLoaded } from 'csdm/ui/demos/use-demos-loaded';
import { FilterSeparator } from 'csdm/ui/components/dropdown-filter/filter-separator';
import { formatDate, type DateRange } from 'csdm/common/date/date-range';
import { PeriodFilter } from 'csdm/ui/components/dropdown-filter/period-filter';
import { SourcesFilter } from 'csdm/ui/components/dropdown-filter/sources-filter';
import { TagsFilter } from 'csdm/ui/components/dropdown-filter/tags-filter';
import { useActiveDemosFilters } from 'csdm/ui/demos/use-active-demos-filters';
import { useFetchDemos } from 'csdm/ui/demos/use-fetch-demos';
import { AnalysisStatusSelect } from 'csdm/ui/components/dropdown-filter/analysis-status-select';
import type { AnalysisStatusFilter } from 'csdm/common/types/analysis-status-filter';
import { useDemosSettings } from 'csdm/ui/settings/use-demos-settings';
import { DemoTypesFilter } from 'csdm/ui/components/dropdown-filter/demo-types-filter';
import { GameFilter } from 'csdm/ui/components/dropdown-filter/game-filter';

export function DemosFilterDropdown() {
  const areDemosLoaded = useDemosLoaded();
  const { sources, types, games, tagIds, startDate, endDate, analysisStatus, updateSettings } = useDemosSettings();
  const { hasActiveFilter, hasActiveSourcesFilter, hasActiveTagsFilter, hasActiveTypesFilter, hasActiveGamesFilter } =
    useActiveDemosFilters();
  const fetchDemos = useFetchDemos();

  const onPeriodChange = (range: DateRange | undefined) => {
    const startDate = formatDate(range?.from);
    const endDate = formatDate(range?.to);
    fetchDemos({
      startDate,
      endDate,
    });
  };
  const onSourcesChange = (sources: DemoSource[]) => {
    fetchDemos({
      sources,
    });
  };
  const onDemoTypesChange = (types: DemoType[]) => {
    fetchDemos({
      types,
    });
  };
  const onGamesChange = (games: Game[]) => {
    fetchDemos({
      games,
    });
  };
  const onAnalysisStatusChange = (analysisStatus: AnalysisStatusFilter) => {
    updateSettings({
      analysisStatus,
    });
  };
  const onTagsChange = (tagIds: string[]) => {
    fetchDemos({
      tagIds,
    });
  };

  return (
    <DropdownFilter isDisabled={!areDemosLoaded} hasActiveFilter={hasActiveFilter}>
      <div className="flex">
        <div className="flex flex-col p-8">
          <PeriodFilter startDate={startDate} endDate={endDate} onRangeChange={onPeriodChange} />
        </div>
        <div className="border-l border-l-gray-300 w-[424px]">
          <div className="p-8">
            <SourcesFilter
              selectedSources={sources}
              onChange={onSourcesChange}
              hasActiveFilter={hasActiveSourcesFilter}
            />
          </div>
          <FilterSeparator />
          <div className="p-8">
            <TagsFilter selectedTagIds={tagIds} onChange={onTagsChange} hasActiveFilter={hasActiveTagsFilter} />
          </div>
          <FilterSeparator />
          <div className="p-8">
            <DemoTypesFilter
              selectedTypes={types}
              onChange={onDemoTypesChange}
              hasActiveFilter={hasActiveTypesFilter}
            />
          </div>
          <FilterSeparator />
          <div className="p-8">
            <AnalysisStatusSelect selectedStatus={analysisStatus} onChange={onAnalysisStatusChange} />
          </div>
          <FilterSeparator />
          <div className="p-8">
            <GameFilter selectedGames={games} onChange={onGamesChange} hasActiveFilter={hasActiveGamesFilter} />
          </div>
        </div>
      </div>
    </DropdownFilter>
  );
}
