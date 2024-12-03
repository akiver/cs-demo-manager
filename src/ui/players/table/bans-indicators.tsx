import React from 'react';
import { Plural } from '@lingui/react/macro';
import { TableStatusBarLegend } from 'csdm/ui/components/table/status-bar/table-status-bar-legend';
import { TableStatusBarRectangle } from 'csdm/ui/components/table/status-bar/table-status-bar-rectangle';
import { usePlayersTable } from './use-players-table';
import { TableStatusBarSeparator } from 'csdm/ui/components/table/status-bar/table-status-bar-separator';

export function BansIndicators() {
  const table = usePlayersTable();
  let vacBannedPlayerCount = 0;
  let gameBannedPlayerCount = 0;
  let communityBannedPlayerCount = 0;

  for (const player of table.getRows()) {
    if (player.isVacBanned) {
      vacBannedPlayerCount++;
    }
    if (player.isGameBanned) {
      gameBannedPlayerCount++;
    }
    if (player.isCommunityBanned) {
      communityBannedPlayerCount++;
    }
  }

  return (
    <>
      <TableStatusBarLegend
        rectangle={<TableStatusBarRectangle className="bg-vac-ban" />}
        text={<Plural value={vacBannedPlayerCount} one="# VAC ban" other="# VAC bans" />}
      />
      <TableStatusBarSeparator />
      <TableStatusBarLegend
        rectangle={<TableStatusBarRectangle className="bg-game-ban" />}
        text={<Plural value={gameBannedPlayerCount} one="# game ban" other="# game bans" />}
      />
      <TableStatusBarSeparator />
      <TableStatusBarLegend
        rectangle={<TableStatusBarRectangle className="bg-community-ban" />}
        text={<Plural value={communityBannedPlayerCount} one="# community ban" other="# community bans" />}
      />
    </>
  );
}
