import React from 'react';
import { RevealDemoInExplorerButton } from 'csdm/ui/components/buttons/reveal-demo-in-explorer-button';
import { useSelectedMatches } from '../use-selected-matches';
import { useMatchesLoaded } from '../use-matches-loaded';
import { lastArrayItem } from 'csdm/common/array/last-array-item';

export function RevealMatchesInExplorerButton() {
  const selectedMatches = useSelectedMatches();
  const matchesLoaded = useMatchesLoaded();

  if (selectedMatches.length === 0) {
    return null;
  }

  const demoPath = lastArrayItem(selectedMatches).demoFilePath;

  return <RevealDemoInExplorerButton isDisabled={!matchesLoaded} demoPath={demoPath} />;
}
