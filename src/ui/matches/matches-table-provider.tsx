import React from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import type { MatchTable } from 'csdm/common/types/match-table';
import { useTable } from '../components/table/use-table';
import { MatchesTableContext } from './table/matches-table-context';
import { useMatchesColumns } from 'csdm/ui/components/matches/use-matches-columns';
import { useContextMenu } from '../components/context-menu/use-context-menu';
import { MatchContextMenu } from './table/match-context-menu';
import type { TableInstance } from '../components/table/table-types';
import { TableName } from 'csdm/node/settings/table/table-name';
import { RenameMatchDialog } from './dialogs/rename-match-dialog';
import { useDialog } from '../components/dialogs/use-dialog';
import { MatchCommentWidget } from 'csdm/ui/components/matches/match-comment-widget';
import { DeleteMatchesDialog } from 'csdm/ui/components/dialogs/delete-matches-dialog';
import { useMatches } from './use-matches';
import { useSelectedMatchChecksums } from './use-selected-match-checksums';
import { useDispatch } from '../store/use-dispatch';
import { selectedMatchesChanged } from './matches-actions';
import { useTableCommentWidgetVisibility } from '../components/table/use-table-comment-widget-visibility';
import { useFuzzySearchText } from './use-fuzzy-search-text';
import { MatchesTagsDialog } from './dialogs/tags-dialog';

function getRowId(match: MatchTable): string {
  return match.checksum;
}

const fuzzySearchColumnIds: Paths<MatchTable>[] = [
  'checksum',
  'name',
  'mapName',
  'teamAName',
  'teamBName',
  'serverName',
  'clientName',
];

type Props = {
  children: ReactNode;
};

export function MatchesTableProvider({ children }: Props) {
  const columns = useMatchesColumns();
  const navigate = useNavigate();
  const { showContextMenu } = useContextMenu();
  const { showDialog } = useDialog();
  const dispatch = useDispatch();
  const {
    isWidgetVisible,
    onKeyDown: onKeyDownCommentWidget,
    showWidget,
    hideWidget,
  } = useTableCommentWidgetVisibility();
  const matches = useMatches();
  const selectedChecksums = useSelectedMatchChecksums();
  const fuzzySearchText = useFuzzySearchText();

  const onContextMenu = (event: MouseEvent, table: TableInstance<MatchTable>) => {
    showContextMenu(
      event,
      <MatchContextMenu
        selectedMatches={table.getSelectedRows()}
        matchChecksums={table.getRowIds()}
        onCommentClick={showWidget}
      />,
    );
  };

  const navigateToMatch = (match: MatchTable) => {
    navigate(match.checksum, {
      state: {
        siblingChecksums: table.getRowIds(),
      },
    });
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

  const onSelectionChanged = (table: TableInstance<MatchTable>) => {
    const selectedChecksums = table.getSelectedRowIds();
    dispatch(selectedMatchesChanged({ selectedChecksums }));
  };

  const table = useTable<MatchTable>({
    columns,
    data: matches,
    getRowId,
    rowSelection: 'multiple',
    fuzzySearchText,
    fuzzySearchColumnIds,
    onRowDoubleClick: navigateToMatch,
    onSelectWithKeyboard: navigateToMatch,
    onContextMenu,
    onKeyDown,
    persistStateKey: TableName.Matches,
    persistScrollKey: TableName.Matches,
    selectedRowIds: selectedChecksums,
    onSelectionChanged,
    sortedColumn: {
      id: 'analyzeDate',
      direction: 'desc',
    },
  });

  return (
    <MatchesTableContext.Provider value={table}>
      {children}
      {isWidgetVisible && <MatchCommentWidget onClose={hideWidget} matches={table.getSelectedRows()} />}
    </MatchesTableContext.Provider>
  );
}
