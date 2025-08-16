import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useDemosColumns } from './use-demos-columns';
import type { Demo } from 'csdm/common/types/demo';
import type { TableInstance } from 'csdm/ui/components/table/table-types';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useNavigateToDemo } from 'csdm/ui/hooks/use-navigate-to-demo';
import { useDemos } from '../use-demos';
import { useFuzzySearchText } from '../use-fuzzy-search-text';
import { useDemosStatus } from '../use-demos-status';
import { Status } from 'csdm/common/types/status';
import { useTable } from 'csdm/ui/components/table/use-table';
import { DemoContextMenu } from './demo-context-menu';
import { TableName } from 'csdm/node/settings/table/table-name';
import { DemoCommentWidget } from './demo-comment-widget';
import { DemosTableContext } from './demos-table-context';
import { DeleteDemosDialog } from 'csdm/ui/components/dialogs/delete-demos-dialog';
import { RenameDemoDialog } from './rename-demo-dialog';
import { selectionChanged } from '../demos-actions';
import { useDemosState } from '../use-demos-state';
import { useFetchDemos } from '../use-fetch-demos';
import { useTableCommentWidgetVisibility } from 'csdm/ui/components/table/use-table-comment-widget-visibility';
import { DemosTagsDialog } from './tags-dialog';
import { useUiSettings } from 'csdm/ui/settings/ui/use-ui-settings';
import { useIsDemoInDatabase } from 'csdm/ui/demo/use-is-demo-in-database';
import { useNavigateToMatch } from 'csdm/ui/hooks/use-navigate-to-match';

function getRowId(demo: Demo) {
  return demo.filePath;
}

const fuzzySearchColumnIds: Paths<Demo>[] = ['checksum', 'name', 'mapName', 'serverName', 'clientName', 'source'];

type Props = {
  children: ReactNode;
};

export function DemosTableProvider({ children }: Props) {
  const dispatch = useDispatch();
  const navigateToDemo = useNavigateToDemo();
  const navigateToMatch = useNavigateToMatch();
  const demos = useDemos();
  const fuzzySearchText = useFuzzySearchText();
  const columns = useDemosColumns();
  const { showContextMenu } = useContextMenu();
  const { redirectDemoToMatch } = useUiSettings();
  const isDemoInDatabase = useIsDemoInDatabase();
  const selectedDemosPaths = useDemosState().selectedDemosPath;
  const status = useDemosStatus();
  const {
    isWidgetVisible,
    onKeyDown: onKeyDownCommentWidget,
    showWidget,
    hideWidget,
  } = useTableCommentWidgetVisibility();
  const { showDialog } = useDialog();
  const fetchDemos = useFetchDemos();

  useEffect(() => {
    if (status === Status.Idle) {
      fetchDemos();
    }
  });

  const onContextMenu = (event: MouseEvent, table: TableInstance<Demo>) => {
    showContextMenu(
      event,
      <DemoContextMenu
        demos={table.getSelectedRows()}
        onCommentClick={showWidget}
        siblingDemoPaths={table.getRowIds()}
      />,
    );
  };

  const handleNavigateToDemo = (demo: Demo, table: TableInstance<Demo>) => {
    if (redirectDemoToMatch && isDemoInDatabase(demo.checksum)) {
      navigateToMatch(demo.checksum);
    } else {
      navigateToDemo(demo.filePath, {
        state: {
          siblingDemoPaths: table.getRowIds(),
        },
      });
    }
  };

  const onKeyDown = (event: KeyboardEvent, table: TableInstance<Demo>) => {
    switch (event.key) {
      case 'Backspace':
        showDialog(<DeleteDemosDialog demos={table.getSelectedRows()} />);
        break;
      case (window.csdm.isMac && 'Enter') || (!window.csdm.isMac && 'F2'):
        showDialog(<RenameDemoDialog demos={table.getSelectedRows()} />);
        break;
      case 't':
        showDialog(<DemosTagsDialog demos={table.getSelectedRows()} />);
        break;
      default:
        onKeyDownCommentWidget(event);
    }
  };

  const onSelectionChanged = (table: TableInstance<Demo>) => {
    const selectedDemosPaths = table.getSelectedRowIds();
    dispatch(
      selectionChanged({
        demosPath: selectedDemosPaths,
      }),
    );
  };

  const table = useTable<Demo>({
    columns,
    data: demos,
    getRowId,
    persistStateKey: TableName.Demos,
    persistScrollKey: TableName.Demos,
    rowSelection: 'multiple',
    fuzzySearchText,
    fuzzySearchColumnIds,
    selectedRowIds: selectedDemosPaths,
    onRowDoubleClick: handleNavigateToDemo,
    onSelectWithKeyboard: handleNavigateToDemo,
    onContextMenu,
    onKeyDown,
    onSelectionChanged,
    sortedColumn: { id: 'date', direction: 'desc' },
  });

  return (
    <DemosTableContext.Provider value={table}>
      {children}
      {isWidgetVisible && <DemoCommentWidget onClose={hideWidget} demos={table.getSelectedRows()} />}
    </DemosTableContext.Provider>
  );
}
