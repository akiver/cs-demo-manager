import { useDemosTable } from './table/use-demos-table';

export function useSelectedDemos() {
  const table = useDemosTable();

  return table.getSelectedRows();
}
