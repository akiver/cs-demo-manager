import React from 'react';
import { DetailsButton } from 'csdm/ui/components/buttons/details-button';
import { useNavigateToPlayer } from 'csdm/ui/hooks/use-navigate-to-player';
import { usePlayersTable } from '../table/use-players-table';
import { usePlayersStatus } from '../use-players-status';
import { Status } from 'csdm/common/types/status';
import { lastArrayItem } from 'csdm/common/array/last-array-item';

export function PlayerDetailsButton() {
  const navigateToPlayer = useNavigateToPlayer();
  const table = usePlayersTable();
  const selectedSteamIds = table.getSelectedRowIds();
  const status = usePlayersStatus();
  const isDisabled = status === Status.Loading || selectedSteamIds.length === 0;

  const onClick = () => {
    if (selectedSteamIds.length === 0) {
      return;
    }

    const steamId = lastArrayItem(selectedSteamIds);
    navigateToPlayer(steamId);
  };

  return <DetailsButton onClick={onClick} isDisabled={isDisabled} />;
}
