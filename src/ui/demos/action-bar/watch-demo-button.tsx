import React from 'react';
import { WatchButton } from 'csdm/ui/components/buttons/watch-button';
import { useDemosLoaded } from 'csdm/ui/demos/use-demos-loaded';
import { useSelectedDemos } from '../use-selected-demos';

export function WatchDemoButton() {
  const selectedDemos = useSelectedDemos();
  const demosLoaded = useDemosLoaded();

  if (selectedDemos.length === 0) {
    return null;
  }

  const selectedDemo = selectedDemos[selectedDemos.length - 1];

  return <WatchButton isDisabled={!demosLoaded} demoPath={selectedDemo.filePath} game={selectedDemo.game} />;
}
