import React from 'react';
import { RefreshButton } from 'csdm/ui/components/buttons/refresh-button';
import { Status } from 'csdm/common/types/status';
import { usePlayersStatus } from '../use-players-status';
import { useFetchPlayers } from '../use-fetch-players';

export function RefreshPlayersButton() {
  const fetchPlayers = useFetchPlayers();
  const status = usePlayersStatus();
  const isDisabled = status === Status.Loading;

  return <RefreshButton isDisabled={isDisabled} onClick={fetchPlayers} />;
}
