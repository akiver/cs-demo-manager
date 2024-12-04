import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Navigate, useLocation } from 'react-router';
import { buildMatchPlayerPath } from 'csdm/ui/routes-paths';
import { useCurrentMatch } from '../use-current-match';
import { Message } from 'csdm/ui/components/message';

export function MatchPlayersLoader() {
  const match = useCurrentMatch();
  const { state } = useLocation();

  if (match.players.length === 0) {
    return <Message message={<Trans>No players found.</Trans>} />;
  }

  return <Navigate to={buildMatchPlayerPath(match.checksum, match.players[0].steamId)} replace={true} state={state} />;
}
