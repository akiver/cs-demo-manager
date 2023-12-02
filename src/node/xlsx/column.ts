import type { CellValue } from './cell-value';

export type Column<RowType> = {
  name: string;
  cellFormatter: (row: RowType) => CellValue;
};
