import React from 'react';
import { Trans } from '@lingui/react/macro';
import { CenteredContent } from 'csdm/ui/components/content';
import { useActiveDemosFilters } from '../use-active-demos-filters';
import { useDemosState } from '../use-demos-state';

export function NoDemos() {
  const { hasActiveFilter } = useActiveDemosFilters();
  const { fuzzySearchText } = useDemosState();
  const message =
    hasActiveFilter || fuzzySearchText !== '' ? (
      <Trans>No demos found with current filters.</Trans>
    ) : (
      <Trans>No demos found in the current folder.</Trans>
    );

  return (
    <CenteredContent>
      <p className="text-subtitle">{message}</p>
    </CenteredContent>
  );
}
