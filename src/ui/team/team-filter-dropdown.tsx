import React from 'react';
import type { DemoSource, DemoType, Game, GameMode } from 'csdm/common/types/counter-strike';
import { DropdownFilter } from 'csdm/ui/components/dropdown-filter/dropdown-filter';
import { FilterSeparator } from 'csdm/ui/components/dropdown-filter/filter-separator';
import { useTeamProfileSettings } from '../settings/use-team-profile-settings';
import { useFetchTeam } from './use-fetch-team';
import { formatDate, type DateRange } from 'csdm/common/date/date-range';
import { PeriodFilter } from 'csdm/ui/components/dropdown-filter/period-filter';
import { SourcesFilter } from 'csdm/ui/components/dropdown-filter/sources-filter';
import { GameModesFilter } from 'csdm/ui/components/dropdown-filter/game-modes-filter';
import { TagsFilter } from 'csdm/ui/components/dropdown-filter/tags-filter';
import { MatchLengthFilter } from 'csdm/ui/components/dropdown-filter/match-length-filter';
import { useActiveTeamFilters } from './use-active-team-filters';
import { DemoTypesFilter } from '../components/dropdown-filter/demo-types-filter';
import { GameFilter } from '../components/dropdown-filter/game-filter';

export function TeamFilterDropdown() {
  const { demoSources, games, gameModes, tagIds, maxRounds, startDate, endDate, demoTypes } = useTeamProfileSettings();
  const fetchTeam = useFetchTeam();
  const {
    hasActiveFilter,
    hasActiveGamesFilter,
    hasActiveSourcesFilter,
    hasActiveTagsFilter,
    hasActiveGameModesFilter,
    hasActiveGameLengthFilter,
    hasActiveDemoTypesFilter,
  } = useActiveTeamFilters();

  const onGamesChange = (games: Game[]) => {
    fetchTeam({
      games,
    });
  };
  const onSourcesChange = (sources: DemoSource[]) => {
    fetchTeam({
      demoSources: sources,
    });
  };
  const onGameModesChange = (modes: GameMode[]) => {
    fetchTeam({
      gameModes: modes,
    });
  };
  const onTagsChange = (tagIds: string[]) => {
    fetchTeam({
      tagIds,
    });
  };
  const onMatchLengthChange = (maxRounds: number[]) => {
    fetchTeam({
      maxRounds,
    });
  };
  const onDemoTypesChange = (demoTypes: DemoType[]) => {
    fetchTeam({
      demoTypes,
    });
  };
  const onPeriodChange = (range: DateRange | undefined) => {
    const startDate = formatDate(range?.from);
    const endDate = formatDate(range?.to);
    fetchTeam({
      startDate,
      endDate,
    });
  };

  return (
    <DropdownFilter hasActiveFilter={hasActiveFilter}>
      <div className="flex">
        <div className="flex flex-col p-8">
          <PeriodFilter startDate={startDate} endDate={endDate} onRangeChange={onPeriodChange} />
        </div>
        <div className="border-l border-l-gray-300 w-[424px]">
          <div className="p-8">
            <SourcesFilter
              selectedSources={demoSources}
              onChange={onSourcesChange}
              hasActiveFilter={hasActiveSourcesFilter}
            />
          </div>
          <FilterSeparator />
          <div className="p-8">
            <GameModesFilter
              selectedGameModes={gameModes}
              onChange={onGameModesChange}
              hasActiveFilter={hasActiveGameModesFilter}
            />
          </div>
          <FilterSeparator />
          <div className="p-8">
            <TagsFilter selectedTagIds={tagIds} onChange={onTagsChange} hasActiveFilter={hasActiveTagsFilter} />
          </div>
          <FilterSeparator />
          <div className="p-8">
            <MatchLengthFilter
              selectedMaxRounds={maxRounds}
              onChange={onMatchLengthChange}
              hasActiveFilter={hasActiveGameLengthFilter}
            />
          </div>
          <FilterSeparator />
          <div className="p-8">
            <DemoTypesFilter
              selectedTypes={demoTypes}
              onChange={onDemoTypesChange}
              hasActiveFilter={hasActiveDemoTypesFilter}
            />
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
