import React from 'react';
import { Trans } from '@lingui/react/macro';
import { CenteredContent } from 'csdm/ui/components/content';
import { useActiveMatchesFilters } from '../use-active-matches-filters';
import { useFuzzySearchText } from '../use-fuzzy-search-text';

export function NoMatches() {
  const { hasActiveFilter } = useActiveMatchesFilters();
  const fuzzySearchText = useFuzzySearchText();
  const message =
    hasActiveFilter || fuzzySearchText !== '' ? (
      <Trans>No match found with active filters.</Trans>
    ) : (
      <Trans>No match found yet, you have to analyze demos to generate matches.</Trans>
    );

  return (
    <CenteredContent>
      <p className="text-subtitle">{message}</p>
    </CenteredContent>
  );
}
