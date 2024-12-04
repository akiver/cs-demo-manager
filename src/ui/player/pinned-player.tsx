import React from 'react';
import { Navigate } from 'react-router';
import { Trans } from '@lingui/react/macro';
import { usePinnedPlayerSteamId } from 'csdm/ui/settings/use-pinned-player-steamid';
import { CenteredContent } from 'csdm/ui/components/content';
import { buildPlayerPath } from '../routes-paths';
import { isEmptyString } from 'csdm/common/string/is-empty-string';

export function PinnedPlayer() {
  const pinnedPlayerSteamId = usePinnedPlayerSteamId();

  if (pinnedPlayerSteamId === undefined || isEmptyString(pinnedPlayerSteamId)) {
    return (
      <CenteredContent>
        <p>
          <Trans>No pinned player found.</Trans>
        </p>
        <p>
          <Trans>You can pin a player from scoreboards or the players list.</Trans>
        </p>
      </CenteredContent>
    );
  }

  return <Navigate to={buildPlayerPath(pinnedPlayerSteamId)} />;
}
