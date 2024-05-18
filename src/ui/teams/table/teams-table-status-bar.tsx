import React from 'react';
import { TableStatusBarSeparator } from 'csdm/ui/components/table/status-bar/table-status-bar-separator';
import { TableStatusBar } from 'csdm/ui/components/table/status-bar/table-status-bar';
import { TeamCount } from './team-count';
import { SelectedTeamCount } from './selected-team-count';

export function TeamsTableStatusBar() {
  return (
    <TableStatusBar>
      <TeamCount />
      <TableStatusBarSeparator />
      <SelectedTeamCount />
    </TableStatusBar>
  );
}
