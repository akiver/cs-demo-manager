import React from 'react';
import { DropdownFilter } from 'csdm/ui/components/dropdown-filter/dropdown-filter';
import { BansFilter } from './ban-filter';
import type { BanFilter } from 'csdm/common/types/ban-filter';
import { useFetchPlayers } from '../use-fetch-players';
import { useActivePlayersFilters } from '../use-active-players-filters';
import { usePlayersSettings } from 'csdm/ui/settings/use-players-settings';

export function PlayersFilterDropdown() {
  const fetchPlayers = useFetchPlayers();
  const { bans } = usePlayersSettings();
  const { hasActiveFilter, hasActiveBanFilters } = useActivePlayersFilters();

  const onBansChange = (bans: BanFilter[]) => {
    fetchPlayers({
      bans,
    });
  };

  return (
    <DropdownFilter hasActiveFilter={hasActiveFilter}>
      <div className="p-8 w-[300px]">
        <BansFilter selectedBans={bans} onChange={onBansChange} hasActiveFilter={hasActiveBanFilters} />
      </div>
    </DropdownFilter>
  );
}
