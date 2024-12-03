import React from 'react';
import { Trans } from '@lingui/react/macro';
import { CenteredContent } from 'csdm/ui/components/content';
import { useActiveTeamsFilters } from './use-active-teams-filters';
import { useTeamsState } from './use-teams-state';

export function NoTeams() {
  const { fuzzySearchText } = useTeamsState();
  const { hasActiveFilter } = useActiveTeamsFilters();
  const message =
    hasActiveFilter || fuzzySearchText !== '' ? (
      <Trans>No team found with current filters.</Trans>
    ) : (
      <Trans>No team found, you have to analyze demos to generate teams.</Trans>
    );
  return (
    <CenteredContent>
      <p className="text-subtitle">{message}</p>
    </CenteredContent>
  );
}
