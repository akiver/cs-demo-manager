import React from 'react';
import { AnalyzeButton } from 'csdm/ui/components/buttons/analyze-button';
import { useSelectedDemos } from 'csdm/ui/demos/use-selected-demos';
import { useDemosLoaded } from 'csdm/ui/demos/use-demos-loaded';

export function AnalyzeDemosButton() {
  const selectedDemos = useSelectedDemos();
  const demosLoaded = useDemosLoaded();

  return <AnalyzeButton isDisabled={!demosLoaded} demos={selectedDemos} />;
}
