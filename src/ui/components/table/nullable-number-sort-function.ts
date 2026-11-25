import type { Column, Data, SortDirection } from './table-types';

// Sorts numbers that may be null, null values (not available) are always last whatever the sort direction.
export function nullableNumberSortFunction<DataType extends Data>(
  sortDirection: SortDirection | undefined,
  column: Column<DataType>,
) {
  return (rowA: DataType, rowB: DataType) => {
    const valueA = (typeof column.accessor === 'string' ? rowA[column.accessor] : column.accessor(rowA)) as
      | number
      | null;
    const valueB = (typeof column.accessor === 'string' ? rowB[column.accessor] : column.accessor(rowB)) as
      | number
      | null;

    if (valueA === null && valueB === null) {
      return 0;
    }

    if (valueA === null) {
      return 1;
    }

    if (valueB === null) {
      return -1;
    }

    return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
  };
}
