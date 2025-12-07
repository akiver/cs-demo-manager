import React from 'react';
import { TeamScore } from 'csdm/ui/components/match/team-score';
import { useTable } from 'csdm/ui/components/table/use-table';
import { Table } from 'csdm/ui/components/table/table';
import type { TableInstance } from 'csdm/ui/components/table/table-types';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import type { RenownPlayer } from 'csdm/common/types/renown-match';
import { RenownScoreboardContextMenu } from './renown-scoreboard-context-menu';
import { useRenownScoreboardColumns } from './use-renown-scoreboard-columns';

function getRowId(player: RenownPlayer) {
  return player.steamId;
}

type Props = {
  players: RenownPlayer[];
  teamName: string;
  teamScore: number;
  scoreOppositeTeam: number;
  isOnLeetify: boolean;
};

export function Scoreboard({ teamName, teamScore, players, scoreOppositeTeam, isOnLeetify }: Props) {
  const columns = useRenownScoreboardColumns();
  const { showContextMenu } = useContextMenu();

  const onContextMenu = (event: MouseEvent, table: TableInstance<RenownPlayer>) => {
    const players = table.getSelectedRows();
    if (players.length !== 1) {
      return;
    }

    showContextMenu(event, <RenownScoreboardContextMenu steamId={players[0].steamId} />);
  };

  const table = useTable({
    columns,
    data: players,
    getRowId,
    rowSelection: 'single',
    onContextMenu,
    sortedColumn: isOnLeetify ? { id: 'leetify-rating', direction: 'desc' } : { id: 'kill-count', direction: 'asc' },
  });

  return (
    <div className="m-auto flex flex-col">
      <TeamScore teamName={teamName} teamScore={teamScore} scoreOppositeTeam={scoreOppositeTeam} />
      <Table<RenownPlayer> table={table} />
    </div>
  );
}
