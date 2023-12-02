import React, { useEffect } from 'react';
import { MatchesActionBar } from 'csdm/ui/matches/actionbar/action-bar';
import { MatchesTable } from 'csdm/ui/matches/table/matches-table';
import { MatchesTableStatusBar } from './table/matches-status-bar';
import { MatchesTableProvider } from './matches-table-provider';
import { useFetchMatches } from './use-fetch-matches';
import { useMatchesStatus } from './use-matches-status';
import { Status } from 'csdm/common/types/status';

export function Matches() {
  const fetchMatches = useFetchMatches();
  const status = useMatchesStatus();

  useEffect(() => {
    if (status === Status.Idle) {
      fetchMatches();
    }
  });

  return (
    <MatchesTableProvider>
      <MatchesActionBar />
      <MatchesTable />
      <MatchesTableStatusBar />
    </MatchesTableProvider>
  );
}
