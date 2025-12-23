import React from 'react';
import { WatchButton } from 'csdm/ui/components/buttons/watch-button';
import { useDemosLoaded } from 'csdm/ui/demos/use-demos-loaded';
import { useSelectedDemos } from '../use-selected-demos';
import { lastArrayItem } from 'csdm/common/array/last-array-item';

export function WatchDemoButton() {
  const selectedDemos = useSelectedDemos();
  const demosLoaded = useDemosLoaded();

  if (selectedDemos.length === 0) {
    return null;
  }

  const selectedDemo = lastArrayItem(selectedDemos);

  return <WatchButton isDisabled={!demosLoaded} demoPath={selectedDemo.filePath} game={selectedDemo.game} />;
}
