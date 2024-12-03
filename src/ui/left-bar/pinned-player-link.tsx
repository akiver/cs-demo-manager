import React from 'react';
import { Trans } from '@lingui/react/macro';
import { LeftBarLink } from './left-bar-link';
import { UserIcon } from 'csdm/ui/icons/user-icon';
import { RoutePath } from 'csdm/ui/routes-paths';

export function PinnedPlayerLink() {
  return (
    <LeftBarLink
      icon={<UserIcon />}
      tooltip={<Trans context="Tooltip">Pinned player</Trans>}
      url={RoutePath.PinnerPlayer}
    />
  );
}
