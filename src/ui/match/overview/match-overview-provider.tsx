import React from 'react';
import type { ReactNode } from 'react';
import { TableName } from 'csdm/node/settings/table/table-name';
import { useCurrentMatch } from '../use-current-match';
import { useScoreboardColumns } from './scoreboard/use-scoreboard-columns';
import { useNavigateToMatchPlayer } from 'csdm/ui/hooks/navigation/use-navigate-to-match-player';
import type { MatchPlayer } from 'csdm/common/types/match-player';
import { ScoreboardContextMenu } from './scoreboard/context-menu/scoreboard-context-menu';
import { MatchOverviewContext } from './match-overview-context';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import type { TableInstance } from 'csdm/ui/components/table/table-types';
import { useTable } from 'csdm/ui/components/table/use-table';

function getRowId(player: MatchPlayer) {
  return player.steamId;
}

type ChildrenProps = {
  tableTeamA: TableInstance<MatchPlayer>;
  tableTeamB: TableInstance<MatchPlayer>;
};

type Props = {
  children: ({ tableTeamA, tableTeamB }: ChildrenProps) => ReactNode;
};

export function MatchOverviewProvider({ children }: Props) {
  const match = useCurrentMatch();
  const playersTeamA = match.players.filter((player) => player.teamName === match.teamA.name);
  const playersTeamB = match.players.filter((player) => player.teamName === match.teamB.name);
  const isDefuseMap = match.mapName.startsWith('de_');
  const { showContextMenu } = useContextMenu();
  const columns = useScoreboardColumns(isDefuseMap);
  const navigateToMatchPlayer = useNavigateToMatchPlayer();

  const onContextMenu = (event: MouseEvent, table: TableInstance<MatchPlayer>) => {
    const players = table.getSelectedRows();
    if (players.length !== 1) {
      return;
    }

    const [player] = players;

    showContextMenu(
      event,
      <ScoreboardContextMenu steamId={player.steamId} name={player.name} demoPath={match.demoFilePath} />,
    );
  };

  const navigateToPlayer = (player: MatchPlayer) => {
    navigateToMatchPlayer(match.checksum, player.steamId);
  };

  const tableTeamA = useTable({
    columns,
    data: playersTeamA,
    rowSelection: 'single',
    persistStateKey: TableName.MatchScoreboard,
    getRowId,
    onContextMenu,
    onRowDoubleClick: navigateToPlayer,
    onSelectWithKeyboard: navigateToPlayer,
    sortedColumn: { id: 'damage-health', direction: 'desc' },
  });

  const tableTeamB = useTable({
    columns,
    data: playersTeamB,
    rowSelection: 'single',
    persistStateKey: TableName.MatchScoreboard,
    getRowId,
    onContextMenu,
    onRowDoubleClick: navigateToPlayer,
    onSelectWithKeyboard: navigateToPlayer,
    sortedColumn: { id: 'damage-health', direction: 'desc' },
  });

  return (
    <MatchOverviewContext.Provider value={{ tableTeamA, tableTeamB }}>
      {children({ tableTeamA, tableTeamB })}
    </MatchOverviewContext.Provider>
  );
}
