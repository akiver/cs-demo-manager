import React from 'react';
import type { ReactNode } from 'react';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import type { PlayerTable } from 'csdm/common/types/player-table';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { useNavigateToPlayer } from 'csdm/ui/hooks/use-navigate-to-player';
import { usePlayers } from '../use-players';
import { usePlayersColumns } from './use-players-columns';
import { useSelectedPlayerSteamIds } from '../use-selected-players-steamids';
import { useFuzzySearchText } from '../use-fuzzy-search-text';
import type { TableInstance } from 'csdm/ui/components/table/table-types';
import { PlayerContextMenu } from './player-context-menu';
import { selectionChanged } from '../players-actions';
import { useTable } from 'csdm/ui/components/table/use-table';
import { TableName } from 'csdm/node/settings/table/table-name';
import { PlayersTableContext } from './players-table-context';
import { useTableCommentWidgetVisibility } from 'csdm/ui/components/table/use-table-comment-widget-visibility';
import { PlayerCommentWidget } from './player-comment-widget';

function getRowId(row: PlayerTable) {
  return row.steamId;
}

const fuzzySearchColumnIds: Paths<PlayerTable>[] = ['name', 'steamId'];

type Props = {
  children: ReactNode;
};

export function PlayersTableProvider({ children }: Props) {
  const dispatch = useDispatch();
  const { showContextMenu } = useContextMenu();
  const navigateToPlayer = useNavigateToPlayer();
  const players = usePlayers();
  const columns = usePlayersColumns();
  const selectedPlayerSteamIds = useSelectedPlayerSteamIds();
  const fuzzySearchText = useFuzzySearchText();
  const {
    isWidgetVisible,
    onKeyDown: onKeyDownCommentWidget,
    showWidget,
    hideWidget,
  } = useTableCommentWidgetVisibility();

  const showPlayer = (player: PlayerTable) => {
    navigateToPlayer(player.steamId);
  };

  const onContextMenu = (event: MouseEvent, table: TableInstance<PlayerTable>) => {
    showContextMenu(event, <PlayerContextMenu players={table.getSelectedRows()} onCommentClick={showWidget} />);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      default:
        onKeyDownCommentWidget(event);
    }
  };

  const onSelectionChanged = (table: TableInstance<PlayerTable>) => {
    const selectedSteamIds = table.getSelectedRowIds();
    dispatch(
      selectionChanged({
        steamIds: selectedSteamIds,
      }),
    );
  };

  const table = useTable({
    columns,
    data: players,
    getRowId,
    persistStateKey: TableName.Players,
    persistScrollKey: TableName.Players,
    rowSelection: 'multiple',
    fuzzySearchColumnIds,
    fuzzySearchText,
    selectedRowIds: selectedPlayerSteamIds,
    onContextMenu,
    onKeyDown,
    onSelectionChanged,
    onRowDoubleClick: showPlayer,
    onSelectWithKeyboard: showPlayer,
    sortedColumn: { id: 'match-count', direction: 'desc' },
  });

  return (
    <PlayersTableContext.Provider value={table}>
      {children}
      {isWidgetVisible && <PlayerCommentWidget onClose={hideWidget} players={table.getSelectedRows()} />}
    </PlayersTableContext.Provider>
  );
}
