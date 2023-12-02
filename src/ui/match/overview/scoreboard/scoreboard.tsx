import React from 'react';
import type { Player } from 'csdm/common/types/player';
import { TeamScore } from '../../../components/match/team-score';
import { ScoreboardContextMenu } from './context-menu/scoreboard-context-menu';
import { TableName } from 'csdm/node/settings/table/table-name';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { useScoreboardColumns } from './use-scoreboard-columns';
import type { TableInstance } from 'csdm/ui/components/table/table-types';
import { useTable } from 'csdm/ui/components/table/use-table';
import { Table } from 'csdm/ui/components/table/table';
import { Message } from 'csdm/ui/components/message';
import { useNavigate } from 'react-router-dom';
import { buildMatchPlayerPath } from 'csdm/ui/routes-paths';

function getRowId(player: Player) {
  return player.steamId;
}

type Props = {
  teamName: string;
  score: number;
  scoreOppositeTeam: number;
  players: Player[];
  isDefuseMap: boolean;
};

export function Scoreboard({ teamName, score, scoreOppositeTeam, isDefuseMap, players }: Props) {
  const { showContextMenu } = useContextMenu();
  const match = useCurrentMatch();
  const columns = useScoreboardColumns(isDefuseMap);
  const navigate = useNavigate();

  const onContextMenu = (event: MouseEvent, table: TableInstance<Player>) => {
    const players = table.getSelectedRows();
    if (players.length !== 1) {
      return;
    }

    showContextMenu(event, <ScoreboardContextMenu steamId={players[0].steamId} demoPath={match.demoFilePath} />);
  };

  const navigateToPlayer = (player: Player) => {
    navigate(buildMatchPlayerPath(match.checksum, player.steamId));
  };

  const table = useTable({
    columns,
    data: players,
    rowSelection: 'single',
    persistStateKey: TableName.MatchScoreboard,
    getRowId,
    onContextMenu,
    onRowDoubleClick: navigateToPlayer,
    onSelectWithKeyboard: navigateToPlayer,
    sortedColumn: { id: 'damage-health', direction: 'desc' },
  });

  return (
    <>
      <TeamScore teamName={teamName} teamScore={score} scoreOppositeTeam={scoreOppositeTeam} />
      {table.isReady() ? (
        <div>
          <Table<Player> table={table} />
        </div>
      ) : (
        <Message message="Loading..." />
      )}
    </>
  );
}
