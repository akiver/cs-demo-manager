import type { SortDirection } from 'csdm/ui/components/table/table-types';

export type ColumnState = {
  id: string;
  isVisible: boolean;
  width: number;
  sortDirection?: SortDirection;
};
