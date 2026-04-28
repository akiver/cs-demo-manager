import type { Column, Data, SortDirection } from './table-types';

export function dateSortFunction<DataType extends Data>(
  sortDirection: SortDirection | undefined,
  column: Column<DataType>,
) {
  return (rowA: DataType, rowB: DataType) => {
    const dateA = (typeof column.accessor === 'string' ? rowA[column.accessor] : column.accessor(rowA)) as string;
    const dateB = (typeof column.accessor === 'string' ? rowB[column.accessor] : column.accessor(rowB)) as string;

    if (!dateA && !dateB) {
      return 0;
    }

    if (!dateA) {
      return 1;
    }

    if (!dateB) {
      return -1;
    }

    if (sortDirection === 'asc') {
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    }

    return new Date(dateB).getTime() - new Date(dateA).getTime();
  };
}
