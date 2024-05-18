import React from 'react';
import { DropdownFilter } from 'csdm/ui/components/dropdown-filter/dropdown-filter';
import { useFetchTeams } from '../use-fetch-teams';
import { useActiveTeamsFilters } from '../use-active-teams-filters';
import { useTeamsSettings } from 'csdm/ui/settings/use-teams-settings';
import { PeriodFilter } from 'csdm/ui/components/dropdown-filter/period-filter';
import { formatDate, type DateRange } from 'csdm/common/date/date-range';

export function TeamsFilterDropdown() {
  const fetchTeams = useFetchTeams();
  const { startDate, endDate } = useTeamsSettings();
  const { hasActiveFilter } = useActiveTeamsFilters();

  const onPeriodChange = (range: DateRange | undefined) => {
    const startDate = formatDate(range?.from);
    const endDate = formatDate(range?.to);

    fetchTeams({
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
      </div>
    </DropdownFilter>
  );
}
