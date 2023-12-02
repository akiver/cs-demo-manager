import React from 'react';
import { TeamScore } from 'csdm/ui/components/match/team-score';
import type { FaceitPlayer } from 'csdm/common/types/faceit-match';
import { useFaceitScoreboardColumns } from './use-faceit-scoreboard-columns';
import { useTable } from 'csdm/ui/components/table/use-table';
import { Table } from 'csdm/ui/components/table/table';
import type { TableInstance } from 'csdm/ui/components/table/table-types';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { FaceitScoreboardContextMenu } from './faceit-scoreboard-context-menu';

function getRowId(player: FaceitPlayer) {
  return player.id;
}

type Props = {
  players: FaceitPlayer[];
  teamName: string;
  teamScore: number;
  scoreOppositeTeam: number;
};

export function Scoreboard({ teamName, teamScore, players, scoreOppositeTeam }: Props) {
  const columns = useFaceitScoreboardColumns();
  const { showContextMenu } = useContextMenu();

  const onContextMenu = (event: MouseEvent, table: TableInstance<FaceitPlayer>) => {
    const players = table.getSelectedRows();
    if (players.length !== 1) {
      return;
    }

    showContextMenu(event, <FaceitScoreboardContextMenu playerNickname={players[0].name} />);
  };

  const table = useTable({
    columns,
    data: players,
    getRowId,
    rowSelection: 'single',
    width: 886,
    onContextMenu,
    sortedColumn: { id: 'kill-count', direction: 'desc' },
  });

  return (
    <div className="flex flex-col m-auto">
      <TeamScore teamName={teamName} teamScore={teamScore} scoreOppositeTeam={scoreOppositeTeam} />
      <Table<FaceitPlayer> table={table} />
    </div>
  );
}
