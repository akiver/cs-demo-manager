import { useContext } from 'react';
import { MatchesTableContext } from './matches-table-context';

export function useMatchesTable() {
  const table = useContext(MatchesTableContext);
  if (!table) {
    throw new Error('useMatchesTable must be used within a MatchesTableContext.Provider');
  }

  return table;
}
