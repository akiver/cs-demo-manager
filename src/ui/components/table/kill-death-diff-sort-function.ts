import type { SortDirection } from './table-types';

export function killDeathDiffSortFunction<DataType extends { killCount: number; deathCount: number }>(
  sortDirection: SortDirection | undefined,
) {
  return (rowA: DataType, rowB: DataType) => {
    const diffA = rowA.killCount - rowA.deathCount;
    const diffB = rowB.killCount - rowB.deathCount;

    return sortDirection === 'asc' ? diffA - diffB : diffB - diffA;
  };
}
