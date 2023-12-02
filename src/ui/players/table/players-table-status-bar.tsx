import React from 'react';
import { TableStatusBarSeparator } from 'csdm/ui/components/table/status-bar/table-status-bar-separator';
import { TableStatusBar } from 'csdm/ui/components/table/status-bar/table-status-bar';
import { PlayerCount } from './player-count';
import { SelectedPlayerCount } from './selected-player-count';
import { BansIndicators } from './bans-indicators';

export function PlayersTableStatusBar() {
  return (
    <TableStatusBar>
      <PlayerCount />
      <TableStatusBarSeparator />
      <SelectedPlayerCount />
      <TableStatusBarSeparator />
      <BansIndicators />
    </TableStatusBar>
  );
}
