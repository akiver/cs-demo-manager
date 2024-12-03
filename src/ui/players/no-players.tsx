import React from 'react';
import { Trans } from '@lingui/react/macro';
import { CenteredContent } from 'csdm/ui/components/content';
import { useActivePlayersFilters } from './use-active-players-filters';
import { usePlayersState } from './use-players-state';

export function NoPlayers() {
  const { fuzzySearchText } = usePlayersState();
  const { hasActiveFilter } = useActivePlayersFilters();
  const message =
    hasActiveFilter || fuzzySearchText !== '' ? (
      <Trans>No player found with current filters.</Trans>
    ) : (
      <Trans>No player found, you have to analyze demos to generate players.</Trans>
    );
  return (
    <CenteredContent>
      <p className="text-subtitle">{message}</p>
    </CenteredContent>
  );
}
