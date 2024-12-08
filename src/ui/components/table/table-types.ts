import type { VirtualItem } from '@tanstack/react-virtual';
import type { CSSProperties, ReactNode } from 'react';

export type Data = Record<string, unknown>;

export type SortDirection = 'asc' | 'desc';

type TextAlign = 'right' | 'left';

export type RowSelection = 'none' | 'single' | 'multiple';

type Accessor<DataType extends Data> = Paths<DataType> | ((data: DataType) => string | number | boolean);

type SortFunction<DataType extends Data> = (
  sortDirection: SortDirection | undefined,
  column: Column<DataType>,
) => (dataA: DataType, dataB: DataType) => number;

export type CellProps<DataType extends Data> = {
  data: DataType;
  rowIndex: number;
  noPadding?: boolean | undefined;
};

export type SortedColumn<ColumnId extends string> = {
  id: ColumnId;
  direction: SortDirection | undefined;
};

export type Column<DataType extends Data = Data> = {
  id: string;
  accessor: Accessor<DataType>;
  width: number;
  headerText: string;
  headerTooltip: string;
  visibilityText?: string | undefined;
  visible?: boolean | undefined;
  showTooltip?: boolean | undefined;
  allowHiding?: boolean | undefined;
  allowResize?: boolean | undefined;
  allowMove?: boolean | undefined;
  allowSort?: boolean | undefined;
  textAlign?: TextAlign | undefined;
  noPadding?: boolean | undefined;
  maxWidth?: number | undefined;
  Cell?: ((props: CellProps<DataType>) => React.ReactElement | null) | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatter?: ((value: any) => ReactNode) | undefined;
  sortFunction?: SortFunction<DataType> | undefined;
};

export type TableInstance<DataType extends Data> = {
  isReady: () => boolean;
  getRowId: (data: DataType) => string;
  getTotalSize: () => number;
  getData: () => DataType[];
  getVirtualItems: () => VirtualItem[];
  getRows: () => DataType[];
  getRowIds: () => string[];
  getRowCount: () => number;
  getSelectedRows: () => DataType[];
  getSelectedRowIds: () => string[];
  getSelectedRowCount: () => number;
  getOrderedColumns: () => Column<DataType>[];
  getHideableColumns: () => Column<DataType>[];
  getColumnWidth: (columnId: string) => number | undefined;
  getColumnSortDirection: (columnId: string) => SortDirection | undefined;
  isSelectionEnabled: () => boolean;
  isRowSelected: (rowId: string) => boolean;
  isColumnVisible: (columnId: string) => boolean;
  showColumn: (columnId: string) => void;
  hideColumn: (columnId: string) => void;
  selectRow: (rowId: string) => void;
  deselectAll: () => void;
  scrollToRow: (rowId: string) => void;
  scrollToIndex: (index: number) => void;
  setFuzzySearchText: (text: string) => void;
  getWrapperProps: () => {
    ref: React.RefObject<HTMLDivElement | null>;
    style: CSSProperties;
  };
  getTableProps: () => {
    onKeyDown: (event: React.KeyboardEvent<HTMLTableElement>) => void;
  };
  getColumnProps: (
    column: Column<DataType>,
    index: number,
  ) => {
    ref: (ref: HTMLTableCellElement | null) => void;
    sortProps: {
      onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
      onMouseUp: (event: React.MouseEvent<HTMLDivElement>) => void;
    };
    dragProps: {
      onDragStart: (event: React.DragEvent<HTMLTableCellElement>) => void;
      onDragEnter: () => void;
      onDragOver: (event: React.DragEvent<HTMLTableCellElement>) => void;
      onDragEnd: () => void;
      onDrop: () => void;
      draggable: boolean;
    };
    resizerProps: {
      onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
      onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
    };
    hasDragOver: boolean;
  };
  getRowProps: (
    rowId: string,
    row: DataType,
    rowIndex: number,
  ) => {
    onMouseDown: (event: React.MouseEvent) => void;
    onDoubleClick: (event: React.MouseEvent) => void;
    onContextMenu: (event: React.MouseEvent) => void;
    style?: CSSProperties | undefined;
  };
};
