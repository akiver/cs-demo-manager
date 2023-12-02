import React from 'react';
import { RevealDemoInExplorerButton } from 'csdm/ui/components/buttons/reveal-demo-in-explorer-button';
import { useSelectedMatches } from '../use-selected-matches';
import { useMatchesLoaded } from '../use-matches-loaded';

export function RevealMatchesInExplorerButton() {
  const selectedMatches = useSelectedMatches();
  const matchesLoaded = useMatchesLoaded();

  if (selectedMatches.length === 0) {
    return null;
  }

  const demoPath = selectedMatches[selectedMatches.length - 1].demoFilePath;

  return <RevealDemoInExplorerButton isDisabled={!matchesLoaded} demoPath={demoPath} />;
}
