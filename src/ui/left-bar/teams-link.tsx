import React from 'react';
import { Trans } from '@lingui/react/macro';
import { LeftBarLink } from './left-bar-link';
import { RoutePath } from 'csdm/ui/routes-paths';
import { TeamIcon } from 'csdm/ui/icons/team-icon';

export function TeamsLink() {
  return <LeftBarLink icon={<TeamIcon />} tooltip={<Trans context="Tooltip">Teams</Trans>} url={RoutePath.Teams} />;
}
