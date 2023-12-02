import React from 'react';
import { WatchButton } from 'csdm/ui/components/buttons/watch-button';
import { useMatchesLoaded } from '../use-matches-loaded';
import { useMatchesTable } from '../table/use-matches-table';

export function WatchMatchButton() {
  const table = useMatchesTable();
  const selectedMatches = table.getSelectedRows();
  const matchesLoaded = useMatchesLoaded();

  if (selectedMatches.length === 0) {
    return null;
  }

  const selectedMatch = selectedMatches[selectedMatches.length - 1];

  return <WatchButton isDisabled={!matchesLoaded} demoPath={selectedMatch.demoFilePath} game={selectedMatch.game} />;
}
