import { useContext } from 'react';
import { TeamsTableContext } from './teams-table-context';

export function useTeamsTable() {
  const table = useContext(TeamsTableContext);
  if (!table) {
    throw new Error('useTeamsTable must be used within a TeamsTableContext.Provider');
  }

  return table;
}
