import React from 'react';
import type { MatchTable } from 'csdm/common/types/match-table';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useMatchesColumns } from 'csdm/ui/components/matches/use-matches-columns';
import { TableName } from 'csdm/node/settings/table/table-name';
import { MatchCommentWidget } from 'csdm/ui/components/matches/match-comment-widget';
import { selectedMatchesChanged } from '../player-actions';
import { useSelectedMatchChecksums } from './use-selected-match-checksums';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { PlayerMatchContextMenu } from './player-match-context-menu';
import { useNavigateToMatch } from 'csdm/ui/hooks/use-navigate-to-match';
import type { TableInstance } from 'csdm/ui/components/table/table-types';
import { useTable } from 'csdm/ui/components/table/use-table';
import { Table } from 'csdm/ui/components/table/table';
import { useTableCommentWidgetVisibility } from 'csdm/ui/components/table/use-table-comment-widget-visibility';
import { usePlayer } from '../use-player';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { DeleteMatchesDialog } from 'csdm/ui/components/dialogs/delete-matches-dialog';
import { RenameMatchDialog } from 'csdm/ui/matches/dialogs/rename-match-dialog';
import { MatchesTagsDialog } from 'csdm/ui/matches/dialogs/tags-dialog';

function getRowId(match: MatchTable) {
  return match.checksum;
}

export function PlayerMatchesTable() {
  const { matches } = usePlayer();
  const dispatch = useDispatch();
  const navigateToMatch = useNavigateToMatch();
  const selectedChecksums = useSelectedMatchChecksums();
  const columns = useMatchesColumns();
  const { showDialog } = useDialog();
  const { showContextMenu } = useContextMenu();
  const {
    isWidgetVisible,
    onKeyDown: onKeyDownCommentWidget,
    showWidget,
    hideWidget,
  } = useTableCommentWidgetVisibility();

  const onRowDoubleClick = (match: MatchTable) => {
    navigateToMatch(match.checksum, {
      state: {
        siblingChecksums: table.getRowIds(),
      },
    });
  };

  const onSelectionChanged = (table: TableInstance<MatchTable>) => {
    const selectedChecksums = table.getSelectedRowIds();
    dispatch(selectedMatchesChanged({ selectedChecksums }));
  };

  const onContextMenu = (event: MouseEvent, table: TableInstance<MatchTable>) => {
    showContextMenu(
      event,
      <PlayerMatchContextMenu
        onCommentClick={showWidget}
        selectedMatches={table.getSelectedRows()}
        matchChecksums={table.getRowIds()}
      />,
    );
  };

  const onKeyDown = (event: KeyboardEvent, table: TableInstance<MatchTable>) => {
    switch (event.key) {
      case 'Backspace': {
        const checksums = table.getSelectedRows().map((match) => match.checksum);
        showDialog(<DeleteMatchesDialog checksums={checksums} />);
        break;
      }
      case (window.csdm.isMac && 'Enter') || (!window.csdm.isMac && 'F2'):
        showDialog(<RenameMatchDialog matches={table.getSelectedRows()} />);
        break;
      case 't':
        showDialog(<MatchesTagsDialog matches={table.getSelectedRows()} />);
        break;
      default:
        onKeyDownCommentWidget(event);
    }
  };

  const table = useTable({
    columns,
    data: matches,
    rowSelection: 'multiple',
    selectedRowIds: selectedChecksums,
    persistStateKey: TableName.Matches,
    getRowId,
    onContextMenu,
    onSelectionChanged,
    onRowDoubleClick,
    onKeyDown,
  });

  return (
    <>
      <Table<MatchTable> table={table} />
      {isWidgetVisible && <MatchCommentWidget onClose={hideWidget} matches={table.getSelectedRows()} />}
    </>
  );
}
