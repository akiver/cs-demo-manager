import React from 'react';
import type { ValvePlayer } from 'csdm/common/types/valve-match';
import { useValveScoreboardColumns } from './use-valve-scoreboard-columns';
import { Table } from '../table/table';
import { useTable } from '../table/use-table';
import type { TableInstance } from '../table/table-types';
import { useContextMenu } from '../context-menu/use-context-menu';
import { ValveScoreboardContextMenu } from './valve-scoreboard-context-menu';
import type { Game } from 'csdm/common/types/counter-strike';

function getRowId(player: ValvePlayer) {
  return player.steamId;
}

type Props = {
  players: ValvePlayer[];
  demoPath: string | undefined;
  game: Game;
  onPlayerSelected: (player: ValvePlayer) => void;
};

export function ValveMatchScoreboard({ players, demoPath, game, onPlayerSelected }: Props) {
  const { showContextMenu } = useContextMenu();
  const columns = useValveScoreboardColumns();

  const onSelectionChanged = (table: TableInstance<ValvePlayer>) => {
    const selectedPlayers = table.getSelectedRows();
    if (selectedPlayers.length > 0) {
      onPlayerSelected(selectedPlayers[0]);
    }
  };

  const onContextMenu = (event: MouseEvent, table: TableInstance<ValvePlayer>) => {
    const players = table.getSelectedRows();
    if (players.length !== 1) {
      return;
    }

    showContextMenu(event, <ValveScoreboardContextMenu steamId={players[0].steamId} demoPath={demoPath} game={game} />);
  };

  const table = useTable({
    columns,
    data: players,
    getRowId,
    rowSelection: 'single',
    onSelectionChanged,
    width: 636,
    onContextMenu,
    sortedColumn: { id: 'kill-count', direction: 'desc' },
  });

  return <Table<ValvePlayer> table={table} />;
}
