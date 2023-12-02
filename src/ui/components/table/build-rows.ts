import { matchSorter } from 'match-sorter';
import type { Data, Column, SortedColumn } from './table-types';

function sortRows<DataType extends Data>(
  column: Column<DataType>,
  sortedColumn: SortedColumn<string>,
  rows: DataType[],
) {
  if (sortedColumn.direction === undefined) {
    return;
  }
  const isAscSort = sortedColumn.direction === 'asc';

  function defaultSortFunction(rowA: DataType, rowB: DataType) {
    const valueA = typeof column.accessor === 'string' ? rowA[column.accessor] : column.accessor(rowA);
    const valueB = typeof column.accessor === 'string' ? rowB[column.accessor] : column.accessor(rowB);
    if (valueA < valueB) {
      return isAscSort ? -1 : 1;
    }
    if (valueA > valueB) {
      return isAscSort ? 1 : -1;
    }

    return 0;
  }

  const sortFunction = column.sortFunction ? column.sortFunction(sortedColumn.direction, column) : defaultSortFunction;
  rows.sort(sortFunction);
}

type BuildRows<DataType extends Data> = {
  data: DataType[];
  fuzzySearchText?: string;
  fuzzySearchColumnIds?: string[];
  columns: readonly Column<DataType>[];
  sortedColumn: SortedColumn<string> | undefined;
};

export function buildRows<DataType extends Data>({
  data,
  fuzzySearchText,
  fuzzySearchColumnIds,
  columns,
  sortedColumn,
}: BuildRows<DataType>): DataType[] {
  const rows = [...data];

  if (sortedColumn) {
    const column = columns.find((column) => column.id === sortedColumn.id);
    if (column) {
      sortRows<DataType>(column, sortedColumn, rows);
    }
  }

  if (typeof fuzzySearchText !== 'string' || fuzzySearchText === '' || fuzzySearchColumnIds?.length === 0) {
    return rows;
  }

  return matchSorter(rows, fuzzySearchText, {
    keys: fuzzySearchColumnIds,
    threshold: matchSorter.rankings.CONTAINS,
  });
}
