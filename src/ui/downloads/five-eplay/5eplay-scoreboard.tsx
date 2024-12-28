import React from 'react';
import { TeamScore } from 'csdm/ui/components/match/team-score';
import { useTable } from 'csdm/ui/components/table/use-table';
import { Table } from 'csdm/ui/components/table/table';
import type { TableInstance } from 'csdm/ui/components/table/table-types';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { use5EPlayScoreboardColumns } from './use-5eplay-scoreboard-columns';
import { FiveEPlayScoreboardContextMenu } from './5eplay-scoreboard-context-menu';
import type { FiveEPlayPlayer } from 'csdm/common/types/5eplay-match';

function getRowId(player: FiveEPlayPlayer) {
  return player.id;
}

type Props = {
  players: FiveEPlayPlayer[];
  teamName: string;
  teamScore: number;
  scoreOppositeTeam: number;
};

export function FiveEPlayScoreboard({ teamName, teamScore, players, scoreOppositeTeam }: Props) {
  const columns = use5EPlayScoreboardColumns();
  const { showContextMenu } = useContextMenu();

  const onContextMenu = (event: MouseEvent, table: TableInstance<FiveEPlayPlayer>) => {
    const players = table.getSelectedRows();
    if (players.length !== 1) {
      return;
    }

    showContextMenu(event, <FiveEPlayScoreboardContextMenu domainId={players[0].domainId} />);
  };

  const table = useTable({
    columns,
    data: players,
    getRowId,
    rowSelection: 'single',
    width: 1016,
    onContextMenu,
    sortedColumn: { id: 'kill-count', direction: 'desc' },
  });

  return (
    <div className="flex flex-col m-auto">
      <TeamScore teamName={teamName} teamScore={teamScore} scoreOppositeTeam={scoreOppositeTeam} />
      <Table<FiveEPlayPlayer> table={table} />
    </div>
  );
}
