import { useContext } from 'react';
import { PlayersTableContext } from './players-table-context';

export function usePlayersTable() {
  const table = useContext(PlayersTableContext);
  if (!table) {
    throw new Error('usePlayersTable must be used within a PlayersTableContext.Provider');
  }

  return table;
}
