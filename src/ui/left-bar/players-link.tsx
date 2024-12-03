import React from 'react';
import { Trans } from '@lingui/react/macro';
import { LeftBarLink } from './left-bar-link';
import { RoutePath } from 'csdm/ui/routes-paths';
import { PlayerIcon } from 'csdm/ui/icons/player-icon';

export function PlayersLink() {
  return (
    <LeftBarLink icon={<PlayerIcon />} tooltip={<Trans context="Tooltip">Players</Trans>} url={RoutePath.Players} />
  );
}
