import React from 'react';
import { DropdownFilter } from 'csdm/ui/components/dropdown-filter/dropdown-filter';
import { BansFilter } from './ban-filter';
import type { BanFilter } from 'csdm/common/types/ban-filter';
import { useFetchPlayers } from '../use-fetch-players';
import { useActivePlayersFilters } from '../use-active-players-filters';
import { usePlayersSettings } from 'csdm/ui/settings/use-players-settings';
import { PeriodFilter } from 'csdm/ui/components/dropdown-filter/period-filter';
import { formatDate, type DateRange } from 'csdm/common/date/date-range';
import { TagsFilter } from 'csdm/ui/components/dropdown-filter/tags-filter';

export function PlayersFilterDropdown() {
  const fetchPlayers = useFetchPlayers();
  const { bans, startDate, endDate, tagIds } = usePlayersSettings();
  const { hasActiveFilter, hasActiveBanFilters, hasActiveTagsFilter } = useActivePlayersFilters();

  const onBansChange = (bans: BanFilter[]) => {
    fetchPlayers({
      bans,
    });
  };

  const onPeriodChange = (range: DateRange | undefined) => {
    const startDate = formatDate(range?.from);
    const endDate = formatDate(range?.to);

    fetchPlayers({
      startDate,
      endDate,
    });
  };

  const onTagsChange = (tagIds: string[]) => {
    fetchPlayers({
      tagIds,
    });
  };

  return (
    <DropdownFilter hasActiveFilter={hasActiveFilter}>
      <div className="flex">
        <div className="flex flex-col p-8">
          <PeriodFilter startDate={startDate} endDate={endDate} onRangeChange={onPeriodChange} />
        </div>
        <div className="border-l border-l-gray-300 w-[300px]">
          <div className="p-8">
            <BansFilter selectedBans={bans} onChange={onBansChange} hasActiveFilter={hasActiveBanFilters} />
          </div>
          <div className="p-8">
            <TagsFilter selectedTagIds={tagIds} onChange={onTagsChange} hasActiveFilter={hasActiveTagsFilter} />
          </div>
        </div>
      </div>
    </DropdownFilter>
  );
}
