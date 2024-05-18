import React, { useEffect, useRef } from 'react';
import { useFetchTeams } from './use-fetch-teams';
import { TeamsTableProvider } from './table/teams-table-provider';
import { TeamsTable } from './teams-table';
import { TeamsActionBar } from './teams-action-bar';

export function Teams() {
  const fetchTeams = useFetchTeams();
  const shouldFetch = useRef(true);

  useEffect(() => {
    if (shouldFetch.current) {
      fetchTeams();
      shouldFetch.current = false;
    }
  });

  return (
    <TeamsTableProvider>
      <TeamsActionBar />
      <TeamsTable />
    </TeamsTableProvider>
  );
}
