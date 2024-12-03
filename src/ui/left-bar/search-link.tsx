import React from 'react';
import { Trans } from '@lingui/react/macro';
import { LeftBarLink } from './left-bar-link';
import { RoutePath } from 'csdm/ui/routes-paths';
import { DatabaseSearchIcon } from '../icons/database-search-icon';

export function SearchLink() {
  return (
    <LeftBarLink
      icon={<DatabaseSearchIcon />}
      tooltip={<Trans context="Tooltip">Search</Trans>}
      url={RoutePath.Search}
    />
  );
}
