import { useContext } from 'react';
import { DemosTableContext } from './demos-table-context';

export function useDemosTable() {
  const table = useContext(DemosTableContext);
  if (!table) {
    throw new Error('useDemosTable must be used within a DemosTableContext.Provider');
  }

  return table;
}
