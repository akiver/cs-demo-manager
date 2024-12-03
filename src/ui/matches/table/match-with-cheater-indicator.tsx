import React from 'react';
import { Plural } from '@lingui/react/macro';
import { TableStatusBarLegend } from 'csdm/ui/components/table/status-bar/table-status-bar-legend';
import { TableStatusBarRectangle } from 'csdm/ui/components/table/status-bar/table-status-bar-rectangle';
import { useMatchesTable } from './use-matches-table';

export function MatchWithCheaterIndicator() {
  const table = useMatchesTable();
  const matches = table.getRows();
  const matchWithCheaterCount = matches.filter((match) => {
    return match.bannedPlayerCount > 0;
  }).length;

  return (
    <TableStatusBarLegend
      rectangle={<TableStatusBarRectangle className="bg-vac-ban" />}
      text={<Plural value={matchWithCheaterCount} one="# match with a cheater" other="# matches with a cheater" />}
    />
  );
}
