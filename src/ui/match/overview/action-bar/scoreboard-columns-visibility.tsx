import React from 'react';
import { ColumnsVisibilityDropdown } from 'csdm/ui/components/table/columns-visibility-dropdown';
import { useMatchOverview } from '../use-match-overview';

export function ScoreboardColumnsVisibility() {
  const { tableTeamA, tableTeamB } = useMatchOverview();

  return <ColumnsVisibilityDropdown table={tableTeamA} tables={[tableTeamB]} isDisabled={false} />;
}
