import React from 'react';
import { DetailsButton } from 'csdm/ui/components/buttons/details-button';
import { useTeamsTable } from '../table/use-teams-table';
import { useTeamsStatus } from '../use-teams-status';
import { Status } from 'csdm/common/types/status';
import { useNavigateToTeam } from 'csdm/ui/hooks/use-navigate-to-team';

export function TeamDetailsButton() {
  const navigateToTeam = useNavigateToTeam();
  const table = useTeamsTable();
  const selectedTeamNames = table.getSelectedRowIds();
  const status = useTeamsStatus();
  const isDisabled = status === Status.Loading || selectedTeamNames.length === 0;

  const onClick = () => {
    if (selectedTeamNames.length === 0) {
      return;
    }

    const name = selectedTeamNames[selectedTeamNames.length - 1];
    navigateToTeam(name);
  };

  return <DetailsButton onClick={onClick} isDisabled={isDisabled} />;
}
