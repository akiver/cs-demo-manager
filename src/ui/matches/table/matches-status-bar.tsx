import React from 'react';
import { TableStatusBar } from 'csdm/ui/components/table/status-bar/table-status-bar';
import { TableStatusBarSeparator } from 'csdm/ui/components/table/status-bar/table-status-bar-separator';
import { MatchWithCheaterIndicator } from './match-with-cheater-indicator';
import { MatchCount } from './match-count';
import { SelectedMatchCount } from './selected-match-count';

export function MatchesTableStatusBar() {
  return (
    <TableStatusBar>
      <MatchCount />
      <TableStatusBarSeparator />
      <SelectedMatchCount />
      <TableStatusBarSeparator />
      <MatchWithCheaterIndicator />
    </TableStatusBar>
  );
}
