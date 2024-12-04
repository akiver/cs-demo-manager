import React, { useEffect, useRef } from 'react';
import { Outlet } from 'react-router';
import { Trans } from '@lingui/react/macro';
import { Status } from 'csdm/common/types/status';
import { Message } from 'csdm/ui/components/message';
import { usePlayerState } from './use-player-state';
import { useFetchPlayer } from './use-fetch-player';
import { LoadPlayerError } from './load-player-error';

export function PlayerLoader() {
  const { errorCode, status } = usePlayerState();
  const fetchPlayer = useFetchPlayer();
  const shouldFetchPlayer = useRef(true);

  useEffect(() => {
    if (status === Status.Idle || shouldFetchPlayer.current) {
      fetchPlayer();
      shouldFetchPlayer.current = false;
    }
  });

  if (status === Status.Idle || status === Status.Loading) {
    return <Message message={<Trans>Loading player…</Trans>} />;
  }

  if (status === Status.Error) {
    return <LoadPlayerError errorCode={errorCode} />;
  }

  return <Outlet />;
}
