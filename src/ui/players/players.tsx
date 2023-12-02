import React, { useEffect, useRef } from 'react';
import { PlayersActionBar } from './action-bar';
import { useFetchPlayers } from './use-fetch-players';
import { PlayersTable } from './players-table';
import { PlayersTableProvider } from './table/players-table-provider';

export function Players() {
  const fetchPlayers = useFetchPlayers();
  const shouldFetchPlayers = useRef(true);

  useEffect(() => {
    if (shouldFetchPlayers.current) {
      fetchPlayers();
      shouldFetchPlayers.current = false;
    }
  });

  return (
    <PlayersTableProvider>
      <PlayersActionBar />
      <PlayersTable />
    </PlayersTableProvider>
  );
}
