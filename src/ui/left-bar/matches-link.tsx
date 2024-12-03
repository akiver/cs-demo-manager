import React from 'react';
import { Trans } from '@lingui/react/macro';
import { LeftBarLink } from 'csdm/ui/left-bar/left-bar-link';
import { RoutePath } from 'csdm/ui/routes-paths';
import { CalendarIcon } from 'csdm/ui/icons/calendar-icon';

export function MatchesLink() {
  return (
    <LeftBarLink icon={<CalendarIcon />} tooltip={<Trans context="Tooltip">Matches</Trans>} url={RoutePath.Matches} />
  );
}
