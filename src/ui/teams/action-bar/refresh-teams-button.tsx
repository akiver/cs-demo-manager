import React from 'react';
import { RefreshButton } from 'csdm/ui/components/buttons/refresh-button';
import { Status } from 'csdm/common/types/status';
import { useTeamsStatus } from '../use-teams-status';
import { useFetchTeams } from '../use-fetch-teams';

export function RefreshTeamsButton() {
  const fetchTeams = useFetchTeams();
  const status = useTeamsStatus();
  const isDisabled = status === Status.Loading;

  return <RefreshButton isDisabled={isDisabled} onClick={fetchTeams} />;
}
