import { useDemosTable } from './table/use-demos-table';

export function useSelectedDemosPaths() {
  const table = useDemosTable();

  return table.getSelectedRowIds();
}
