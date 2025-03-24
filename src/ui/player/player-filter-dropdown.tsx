import React from 'react';
import type { DemoSource, DemoType, Game, GameMode } from 'csdm/common/types/counter-strike';
import { DropdownFilter } from 'csdm/ui/components/dropdown-filter/dropdown-filter';
import { FilterSeparator } from 'csdm/ui/components/dropdown-filter/filter-separator';
import { usePlayerProfileSettings } from 'csdm/ui/settings/use-player-profile-settings';
import { useFetchPlayer } from './use-fetch-player';
import type { RankingFilter } from 'csdm/common/types/ranking-filter';
import { formatDate, type DateRange } from 'csdm/common/date/date-range';
import { PeriodFilter } from 'csdm/ui/components/dropdown-filter/period-filter';
import { SourcesFilter } from 'csdm/ui/components/dropdown-filter/sources-filter';
import { GameModesFilter } from 'csdm/ui/components/dropdown-filter/game-modes-filter';
import { TagsFilter } from 'csdm/ui/components/dropdown-filter/tags-filter';
import { RankingSelect } from 'csdm/ui/components/dropdown-filter/ranking-select';
import { MatchLengthFilter } from 'csdm/ui/components/dropdown-filter/match-length-filter';
import { useActivePlayerFilters } from './use-active-player-filters';
import { DemoTypesFilter } from '../components/dropdown-filter/demo-types-filter';
import { GameFilter } from '../components/dropdown-filter/game-filter';

export function PlayerFilterDropdown() {
  const { demoSources, games, gameModes, ranking, tagIds, maxRounds, startDate, endDate, demoTypes } =
    usePlayerProfileSettings();
  const fetchPlayer = useFetchPlayer();
  const {
    hasActiveFilter,
    hasActiveGamesFilter,
    hasActiveSourcesFilter,
    hasActiveTagsFilter,
    hasActiveGameModesFilter,
    hasActiveGameLengthFilter,
    hasActiveDemoTypesFilter,
  } = useActivePlayerFilters();

  const onGamesChange = (games: Game[]) => {
    fetchPlayer({
      games,
    });
  };
  const onSourcesChange = (sources: DemoSource[]) => {
    fetchPlayer({
      demoSources: sources,
    });
  };
  const onGameModesChange = (modes: GameMode[]) => {
    fetchPlayer({
      gameModes: modes,
    });
  };
  const onTagsChange = (tagIds: string[]) => {
    fetchPlayer({
      tagIds,
    });
  };
  const onRankingChange = (ranking: RankingFilter) => {
    fetchPlayer({
      ranking,
    });
  };
  const onMatchLengthChange = (maxRounds: number[]) => {
    fetchPlayer({
      maxRounds,
    });
  };
  const onDemoTypesChange = (demoTypes: DemoType[]) => {
    fetchPlayer({
      demoTypes,
    });
  };
  const onPeriodChange = (range: DateRange | undefined) => {
    const startDate = formatDate(range?.from);
    const endDate = formatDate(range?.to);
    fetchPlayer({
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
            <RankingSelect selectedRanking={ranking} onChange={onRankingChange} />
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
