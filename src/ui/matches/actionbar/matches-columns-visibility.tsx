import React from 'react';
import { ColumnsVisibilityDropdown } from 'csdm/ui/components/table/columns-visibility-dropdown';
import { useMatchesLoaded } from 'csdm/ui/matches/use-matches-loaded';
import { useMatchesTable } from 'csdm/ui/matches/table/use-matches-table';

export function MatchesColumnsVisibility() {
  const table = useMatchesTable();
  const matchesLoaded = useMatchesLoaded();

  return <ColumnsVisibilityDropdown table={table} isDisabled={!matchesLoaded} />;
}
