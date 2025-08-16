import { useReducer, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { ColumnState } from 'csdm/node/settings/table/column-state';
import type { TableName } from 'csdm/node/settings/table/table-name';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { isCtrlOrCmdEvent, isSelectAllKeyboardEvent } from 'csdm/ui/keyboard/keyboard';
import { getTableRowHeight } from './get-table-row-height';
import { buildRows } from './build-rows';
import type { Data, RowSelection, Column, TableInstance, SortedColumn } from './table-types';
import { useLocale } from 'csdm/ui/settings/ui/use-locale';

function buildColumnsWidthMapping<DataType extends Data>(columns: readonly Column<DataType>[]) {
  return Object.fromEntries(
    columns.map((column) => {
      return [column.id, column.width];
    }),
  );
}

type Options<DataType extends Data> = {
  data: DataType[];
  columns: readonly Column<DataType>[];
  getRowId: (data: DataType) => string;
  rowSelection: RowSelection;
  persistStateKey?: TableName;
  persistScrollKey?: TableName;
  width?: number;
  fuzzySearchText?: string;
  fuzzySearchColumnIds?: string[];
  selectedRowIds?: string[];
  sortedColumn?: SortedColumn<string>;
  columnsWidth?: Record<string, number>;
  onSelectionChanged?: (table: TableInstance<DataType>) => void;
  onRowDoubleClick?: (data: DataType, table: TableInstance<DataType>) => void;
  onSelectWithKeyboard?: (data: DataType, table: TableInstance<DataType>) => void;
  onContextMenu?: (event: MouseEvent, table: TableInstance<DataType>) => void;
  onKeyDown?: (event: KeyboardEvent, table: TableInstance<DataType>) => void;
  getRowStyle?: (data: DataType) => CSSProperties | undefined;
};

export function useTable<DataType extends Data>({
  data,
  columns,
  fuzzySearchText,
  fuzzySearchColumnIds,
  getRowId,
  rowSelection,
  onSelectionChanged,
  onKeyDown,
  onRowDoubleClick,
  onSelectWithKeyboard,
  onContextMenu,
  persistStateKey,
  persistScrollKey,
  getRowStyle,
  width,
  selectedRowIds,
  sortedColumn,
}: Options<DataType>): TableInstance<DataType> {
  const client = useWebSocketClient();
  const locale = useLocale();
  const render = useReducer(() => ({}), {})[1];
  const isReady = useRef(persistStateKey === undefined);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const columnsRef = useRef<HTMLTableCellElement[]>([]);
  const sortedColumnRef = useRef<SortedColumn<string> | undefined>(sortedColumn);
  const columnOrderRef = useRef<string[]>(columns.map((column) => column.id));
  const columnVisibilityRef = useRef<Record<string, boolean>>({});
  const columnsWidthRef = useRef<Record<string, number>>(buildColumnsWidthMapping(columns));
  const selectedRowIdsRef = useRef<string[]>(selectedRowIds ?? []);
  const fuzzySearchTextRef = useRef(fuzzySearchText);
  const lastSelectedRowIndex = useRef(0);
  const dragOverColumnIndex = useRef(-1);
  const draggedColumnIndex = useRef(-1);
  const isFirstRender = useRef(true);
  const rows = buildRows<DataType>({
    data,
    fuzzySearchText: fuzzySearchTextRef.current,
    fuzzySearchColumnIds,
    columns,
    sortedColumn: sortedColumnRef.current,
    locale,
  });

  const { getVirtualItems, getTotalSize, scrollToIndex, scrollToOffset, scrollOffset } = useVirtualizer({
    count: rows.length,
    overscan: 10,
    useAnimationFrameWithResizeObserver: true,
    getScrollElement: () => {
      return wrapperRef.current;
    },
    estimateSize: getTableRowHeight,
  });

  useEffect(() => {
    if (!isFirstRender.current || !isReady.current) {
      return;
    }

    if (!persistScrollKey) {
      isFirstRender.current = false;
      return;
    }

    const savedScrollOffset = window.sessionStorage.getItem(persistScrollKey);
    if (savedScrollOffset) {
      const scrollOffset = parseInt(savedScrollOffset, 10);
      if (isNaN(scrollOffset)) {
        return;
      }
      window.requestAnimationFrame(() => {
        scrollToOffset(scrollOffset);
      });
    }

    isFirstRender.current = false;
  });

  useEffect(() => {
    if (!persistStateKey) {
      return;
    }

    const loadPersistedState = async () => {
      const columnsState: ColumnState[] = await window.csdm.readTableState(persistStateKey);
      if (columnsState.length > 0) {
        columnOrderRef.current = columnsState.map((state) => state.id);
      }
      for (const columnState of columnsState) {
        if (columnsWidthRef.current[columnState.id]) {
          columnsWidthRef.current[columnState.id] = columnState.width;
        }

        if (!columnState.isVisible) {
          columnVisibilityRef.current[columnState.id] = false;
        }

        if (columnState.sortDirection !== undefined) {
          sortedColumnRef.current = {
            id: columnState.id,
            direction: columnState.sortDirection,
          };
        }
      }

      isReady.current = true;
      render();
    };

    loadPersistedState();
  }, [persistStateKey, client, render]);

  useEffect(() => {
    if (!persistScrollKey || scrollOffset === null) {
      return;
    }

    window.sessionStorage.setItem(persistScrollKey, String(scrollOffset));
  }, [persistScrollKey, scrollOffset]);

  useEffect(() => {
    const onResetTables = () => {
      sortedColumnRef.current = sortedColumn;
      columnsWidthRef.current = buildColumnsWidthMapping(columns);
      columnVisibilityRef.current = {};

      render();
    };

    client.on(RendererServerMessageName.ResetTablesStateSuccess, onResetTables);

    return () => {
      client.off(RendererServerMessageName.ResetTablesStateSuccess, onResetTables);
    };
  }, [client, render, sortedColumn, columns]);

  const onTableKeyDown = (event: React.KeyboardEvent<HTMLTableElement>) => {
    if (isSelectAllKeyboardEvent(event.nativeEvent)) {
      if (rowSelection !== 'multiple') {
        return;
      }

      updateSelection(rows.map((row) => getRowId(row)));
    } else if (onKeyDown) {
      onKeyDown(event.nativeEvent, table);
    }
  };

  const updateSelection = (rowIds: string[]) => {
    selectedRowIdsRef.current = rowIds;
    onSelectionChanged?.(table);
    render();
  };

  const getOrderedColumns = (visibleColumns: Column<DataType>[]) => {
    let orderedColumns: Column<DataType>[] = [];
    const columnOrderCopy = [...columnOrderRef.current];
    while (visibleColumns.length > 0 && columnOrderCopy.length > 0) {
      const columnId = columnOrderCopy.shift();
      const foundIndex = visibleColumns.findIndex((column) => column.id === columnId);
      if (foundIndex > -1) {
        orderedColumns.push(visibleColumns.splice(foundIndex, 1)[0]);
      }
    }

    orderedColumns = [...orderedColumns, ...visibleColumns];

    return orderedColumns;
  };

  const persistTableState = () => {
    if (!persistStateKey) {
      return;
    }

    const orderedColumns = getOrderedColumns([...columns]);
    const columnsState: ColumnState[] = orderedColumns.map((column) => {
      return {
        id: column.id,
        isVisible: columnVisibilityRef.current[column.id] ?? true,
        width: columnsWidthRef.current[column.id],
        sortDirection: sortedColumnRef.current?.id === column.id ? sortedColumnRef.current.direction : undefined,
      };
    });
    window.csdm.writeTableState(persistStateKey, columnsState);
  };

  const table: TableInstance<DataType> = {
    isReady: () => isReady.current,
    getVirtualItems,
    getTotalSize,
    scrollToIndex,
    getRows: () => rows,
    getRowIds: () => {
      return rows.map((row) => getRowId(row));
    },
    getOrderedColumns: () => {
      const orderedColumns = [...columns];
      if (columnOrderRef.current.length === 0) {
        return orderedColumns;
      }

      return getOrderedColumns(orderedColumns);
    },
    getHideableColumns: () => {
      return columns.filter((column) => {
        return column.allowHiding !== false;
      });
    },
    getColumnWidth: (columnId) => {
      return columnsWidthRef.current[columnId];
    },
    getColumnSortDirection: (columnId) => {
      if (sortedColumnRef.current === undefined) {
        return undefined;
      }

      return sortedColumnRef.current.id === columnId ? sortedColumnRef.current.direction : undefined;
    },
    isColumnVisible: (columnId) => {
      return columnVisibilityRef.current[columnId] === undefined || columnVisibilityRef.current[columnId] === true;
    },
    isSelectionEnabled: () => {
      return rowSelection !== 'none';
    },
    deselectAll: () => {
      updateSelection([]);
    },
    showColumn: (columnId) => {
      columnVisibilityRef.current[columnId] = true;
      persistTableState();
      render();
    },
    hideColumn: (columnId) => {
      columnVisibilityRef.current[columnId] = false;
      persistTableState();
      render();
    },
    scrollToRow: (rowId) => {
      const rowToScrollIndex = rows.findIndex((row) => {
        return getRowId(row) === rowId;
      });
      if (rowToScrollIndex > -1) {
        scrollToIndex(rowToScrollIndex);
      }
    },
    selectRow: (rowId) => {
      updateSelection([rowId]);
    },
    getWrapperProps: () => {
      return {
        ref: wrapperRef,
        style: {
          width,
        },
      };
    },
    getTableProps: () => {
      return {
        onKeyDown: onTableKeyDown,
      };
    },
    getColumnProps: (column: Column<DataType>, index: number) => {
      let resizeInitialWidth = column.width;
      let resizeInitialPageX = 0;
      let newWidth = 0;
      let mouseDownEventOccurred = false;
      const columnRef = columnsRef.current[index];
      const dragEnabled = column.allowMove !== false;

      const onMouseDown = () => {
        mouseDownEventOccurred = true;
      };

      const onMouseUp = () => {
        if (!mouseDownEventOccurred) {
          return;
        }

        mouseDownEventOccurred = false;

        const columnId = column.id;

        if (sortedColumnRef.current === undefined) {
          sortedColumnRef.current = {
            id: columnId,
            direction: 'asc',
          };
        } else {
          if (sortedColumnRef.current.id === columnId) {
            const currentDirection = sortedColumnRef.current.direction;
            sortedColumnRef.current.direction =
              currentDirection === 'asc' ? 'desc' : currentDirection === 'desc' ? undefined : 'asc';
          } else {
            sortedColumnRef.current = {
              id: columnId,
              direction: 'asc',
            };
          }
        }

        persistTableState();
        render();
      };

      const onResizerMouseMove = (event: MouseEvent) => {
        if (!columnRef) {
          return;
        }

        const diffX = event.pageX - resizeInitialPageX;
        const futureWidth = resizeInitialWidth + diffX;
        const minColumnWidth = 20;
        const maxWidth = column.maxWidth ?? 400;
        if (futureWidth >= minColumnWidth && futureWidth <= maxWidth) {
          newWidth = futureWidth;
          columnRef.style.width = `${newWidth}px`;
        }
      };

      const onResizerMouseUp = () => {
        document.removeEventListener('mousemove', onResizerMouseMove);
        document.removeEventListener('mouseup', onResizerMouseUp);

        if (columnRef && newWidth !== 0) {
          columnsWidthRef.current[column.id] = newWidth;
          persistTableState();
        }
      };

      const onResizerMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!columnRef) {
          return;
        }

        newWidth = 0;
        event.preventDefault();
        event.stopPropagation();
        resizeInitialWidth = columnRef.clientWidth;
        resizeInitialPageX = event.pageX;
        document.addEventListener('mousemove', onResizerMouseMove);
        document.addEventListener('mouseup', onResizerMouseUp);
      };

      const onResizerClick = (event: React.MouseEvent) => {
        event.stopPropagation();
      };

      const onDragStart = (event: React.DragEvent<HTMLTableCellElement>) => {
        draggedColumnIndex.current = index;
        event.dataTransfer.dropEffect = 'move';
        event.dataTransfer.effectAllowed = 'move';

        const onWindowDrop = () => {
          dragOverColumnIndex.current = -1;
          draggedColumnIndex.current = -1;
          window.removeEventListener('drop', onWindowDrop);
        };

        window.addEventListener('drop', onWindowDrop);
      };

      const onDragEnter = () => {
        dragOverColumnIndex.current = index;
        render();
      };

      const onDragOver = (event: React.DragEvent<HTMLTableCellElement>) => {
        event.preventDefault();
      };

      const onDragEnd = () => {
        dragOverColumnIndex.current = -1;
        draggedColumnIndex.current = -1;

        render();
      };

      const onDrop = () => {
        if (draggedColumnIndex.current < 0 || index < 0) {
          return;
        }

        const newColumnOrder = [...columnOrderRef.current];
        const sourceIndex = draggedColumnIndex.current;
        const destinationIndex = index;
        newColumnOrder.splice(sourceIndex, 1);
        newColumnOrder.splice(destinationIndex, 0, columnOrderRef.current[sourceIndex]);
        columnOrderRef.current = newColumnOrder;

        dragOverColumnIndex.current = -1;
        draggedColumnIndex.current = -1;

        render();
        persistTableState();
      };

      const setupRef = (ref: HTMLTableCellElement | null) => {
        if (ref) {
          columnsRef.current[index] = ref;
        }
      };

      return {
        ref: setupRef,
        sortProps: {
          onMouseDown,
          onMouseUp,
        },
        dragProps: {
          onDragStart,
          onDragEnter,
          onDragOver,
          onDragEnd,
          onDrop,
          draggable: dragEnabled,
        },
        resizerProps: {
          onMouseDown: onResizerMouseDown,
          onClick: onResizerClick,
        },
        hasDragOver: dragOverColumnIndex.current === index,
      };
    },
    getRowProps: (rowId: string, row: DataType, rowIndex: number) => {
      return {
        onMouseDown: (event: React.MouseEvent) => {
          if (event.detail !== 1 || event.buttons !== 1) {
            // Prevents text selection for tables that have a double click handler.
            if (onRowDoubleClick !== undefined) {
              event.preventDefault();
            }
            return;
          }

          if (rowSelection === 'none') {
            return;
          }

          if (rowSelection === 'single') {
            updateSelection([rowId]);
            return;
          }

          const isCtrlOrCmdPressed = isCtrlOrCmdEvent(event.nativeEvent);
          let newSelectedRowIds = isCtrlOrCmdPressed ? [...selectedRowIdsRef.current] : [];
          let newLastSelectedRowIndex = lastSelectedRowIndex.current;
          switch (true) {
            case event.shiftKey: {
              event.preventDefault(); // Prevents text selection.
              const startIndex = Math.min(rowIndex, lastSelectedRowIndex.current);
              const endIndex = Math.max(rowIndex, lastSelectedRowIndex.current);
              for (let index = startIndex; index <= endIndex; index++) {
                newSelectedRowIds.push(getRowId(rows[index]));
              }
              break;
            }
            case isCtrlOrCmdPressed:
              event.preventDefault(); // Prevents text selection.
              if (selectedRowIdsRef.current.includes(rowId)) {
                newSelectedRowIds = selectedRowIdsRef.current.filter((id) => id !== rowId);
              } else {
                newSelectedRowIds.push(rowId);
              }
              newLastSelectedRowIndex = rowIndex;
              break;
            default:
              newSelectedRowIds.push(rowId);
              newLastSelectedRowIndex = rowIndex;
          }

          lastSelectedRowIndex.current = newLastSelectedRowIndex;

          updateSelection(newSelectedRowIds);
        },
        onDoubleClick: () => {
          onRowDoubleClick?.(row, table);
        },
        onContextMenu: (event: React.MouseEvent) => {
          if (rowSelection !== 'none' && !selectedRowIdsRef.current.includes(rowId)) {
            updateSelection([rowId]);
          }

          onContextMenu?.(event.nativeEvent, table);
        },
        onKeyDown: (event: React.KeyboardEvent<HTMLTableRowElement>) => {
          if (rowSelection === 'none') {
            return;
          }

          switch (true) {
            case event.key === 'ArrowDown': {
              event.preventDefault();

              if (window.csdm.isMac && event.metaKey && onSelectWithKeyboard) {
                onSelectWithKeyboard(row, table);
                return;
              }

              const nextRowIndex = rowIndex + 1;
              if (nextRowIndex >= rows.length) {
                return;
              }
              const rowElement = event.target as HTMLTableRowElement;
              const nextRowElement = rowElement.nextElementSibling as HTMLTableRowElement | null;
              if (nextRowElement) {
                nextRowElement.focus();
              }

              const newRowIndex = nextRowIndex;
              const currentRowIndex = rowIndex;
              let newSelectedRowIds: string[] = [];
              const rowToSelect = rows[newRowIndex];
              const rowToSelectId = getRowId(rowToSelect);
              if (rowSelection === 'multiple' && event.shiftKey) {
                if (selectedRowIdsRef.current.includes(rowToSelectId)) {
                  const currentRowId = getRowId(rows[currentRowIndex]);
                  newSelectedRowIds = selectedRowIdsRef.current.filter((rowId) => {
                    return rowId !== currentRowId;
                  });
                } else {
                  newSelectedRowIds = [...selectedRowIdsRef.current, rowToSelectId];
                }
              } else {
                newSelectedRowIds = [rowToSelectId];
              }

              updateSelection(newSelectedRowIds);
              break;
            }
            case event.key === 'ArrowUp': {
              event.preventDefault();
              const previousRowIndex = rowIndex - 1;

              if (previousRowIndex < 0) {
                return;
              }

              const rowElement = event.target as HTMLTableRowElement;
              const previousRowElement = rowElement.previousElementSibling as HTMLTableRowElement | null;
              if (previousRowElement) {
                previousRowElement.focus();
              }

              const newRowIndex = previousRowIndex;
              const currentRowIndex = rowIndex;
              let newSelectedRowIds: string[] = [];
              const rowToSelect = rows[newRowIndex];
              const rowToSelectId = getRowId(rowToSelect);
              if (rowSelection === 'multiple' && event.shiftKey) {
                if (selectedRowIdsRef.current.includes(rowToSelectId)) {
                  const currentRowId = getRowId(rows[currentRowIndex]);
                  newSelectedRowIds = selectedRowIdsRef.current.filter((rowId) => {
                    return rowId !== currentRowId;
                  });
                } else {
                  newSelectedRowIds = [...selectedRowIdsRef.current, rowToSelectId];
                }
              } else {
                newSelectedRowIds = [rowToSelectId];
              }

              updateSelection(newSelectedRowIds);
              break;
            }
            case event.key === 'Enter': {
              if (!window.csdm.isWindows || !onSelectWithKeyboard) {
                return;
              }
              event.preventDefault();
              onSelectWithKeyboard(row, table);
            }
          }
        },
        style: getRowStyle?.(row),
      };
    },
    getSelectedRows: () => {
      const selectedRows: DataType[] = [];
      for (const selectedRowId of selectedRowIdsRef.current) {
        const selectedRow = rows.find((row) => getRowId(row) === selectedRowId);
        if (selectedRow) {
          selectedRows.push(selectedRow);
        }
      }

      return selectedRows;
    },
    getSelectedRowIds: () => {
      return selectedRowIdsRef.current;
    },
    getRowCount: () => {
      return rows.length;
    },
    getSelectedRowCount: () => {
      return selectedRowIdsRef.current.length;
    },
    isRowSelected: (rowId) => {
      return selectedRowIdsRef.current.includes(rowId);
    },
    getRowId,
    setFuzzySearchText: (text) => {
      fuzzySearchTextRef.current = text;
      render();
    },
    getData: () => {
      return data;
    },
  };

  return table;
}
