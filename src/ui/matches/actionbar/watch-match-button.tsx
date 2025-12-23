import React from 'react';
import { WatchButton } from 'csdm/ui/components/buttons/watch-button';
import { useMatchesLoaded } from '../use-matches-loaded';
import { useMatchesTable } from '../table/use-matches-table';
import { lastArrayItem } from 'csdm/common/array/last-array-item';

export function WatchMatchButton() {
  const table = useMatchesTable();
  const selectedMatches = table.getSelectedRows();
  const matchesLoaded = useMatchesLoaded();

  if (selectedMatches.length === 0) {
    return null;
  }

  const selectedMatch = lastArrayItem(selectedMatches);

  return <WatchButton isDisabled={!matchesLoaded} demoPath={selectedMatch.demoFilePath} game={selectedMatch.game} />;
}
