import React from 'react';
import type { DemoSource, DemoType, Game, GameMode } from 'csdm/common/types/counter-strike';
import { DropdownFilter } from 'csdm/ui/components/dropdown-filter/dropdown-filter';
import { SourcesFilter } from 'csdm/ui/components/dropdown-filter/sources-filter';
import { TagsFilter } from 'csdm/ui/components/dropdown-filter/tags-filter';
import { GameModesFilter } from 'csdm/ui/components/dropdown-filter/game-modes-filter';
import { RankingSelect } from 'csdm/ui/components/dropdown-filter/ranking-select';
import { PeriodFilter } from 'csdm/ui/components/dropdown-filter/period-filter';
import { FilterSeparator } from 'csdm/ui/components/dropdown-filter/filter-separator';
import { RankingFilter } from 'csdm/common/types/ranking-filter';
import { useMatchesLoaded } from 'csdm/ui/matches/use-matches-loaded';
import { useFetchMatches } from 'csdm/ui/matches/use-fetch-matches';
import { formatDate, type DateRange } from 'csdm/common/date/date-range';
import { useActiveMatchesFilters } from '../use-active-matches-filters';
import { MatchLengthFilter } from 'csdm/ui/components/dropdown-filter/match-length-filter';
import { useMatchesSettings } from 'csdm/ui/settings/use-matches-settings';
import { DemoTypesFilter } from 'csdm/ui/components/dropdown-filter/demo-types-filter';
import { GameFilter } from 'csdm/ui/components/dropdown-filter/game-filter';

export function MatchesFilterDropdown() {
  const areMatchesLoaded = useMatchesLoaded();
  const { sources, gameModes, games, ranking, tagIds, startDate, endDate, maxRounds, demoTypes } = useMatchesSettings();
  const fetchMatches = useFetchMatches();
  const {
    hasActiveFilter,
    hasActiveSourcesFilter,
    hasActiveTagsFilter,
    hasActiveGameModesFilter,
    hasActiveGameLengthFilter,
    hasActiveDemoTypesFilter,
    hasActiveGamesFilter,
  } = useActiveMatchesFilters();

  const onSourcesChange = (sources: DemoSource[]) => {
    fetchMatches({
      demoSources: sources,
    });
  };
  const onGamesChange = (games: Game[]) => {
    fetchMatches({
      games,
    });
  };
  const onGameModesChange = (gameModes: GameMode[]) => {
    fetchMatches({
      gameModes,
    });
  };
  const onTagsChange = (tagIds: string[]) => {
    fetchMatches({
      tagIds,
    });
  };
  const onRankingChange = (ranking: RankingFilter) => {
    fetchMatches({
      ranking,
    });
  };
  const onMatchLengthChanged = (maxRounds: number[]) => {
    fetchMatches({
      maxRounds,
    });
  };
  const onDemoTypesChanged = (demoTypes: DemoType[]) => {
    fetchMatches({
      demoTypes,
    });
  };
  const onPeriodChange = (range: DateRange | undefined) => {
    const startDate = formatDate(range?.from);
    const endDate = formatDate(range?.to);

    fetchMatches({
      startDate,
      endDate,
    });
  };

  return (
    <DropdownFilter isDisabled={!areMatchesLoaded} hasActiveFilter={hasActiveFilter}>
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
              onChange={onMatchLengthChanged}
              hasActiveFilter={hasActiveGameLengthFilter}
            />
          </div>
          <FilterSeparator />
          <div className="p-8">
            <DemoTypesFilter
              selectedTypes={demoTypes}
              onChange={onDemoTypesChanged}
              hasActiveFilter={hasActiveDemoTypesFilter}
            />
          </div>
          <FilterSeparator />
          <div className="p-8">
            <RankingSelect selectedRanking={ranking ?? RankingFilter.All} onChange={onRankingChange} />
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
