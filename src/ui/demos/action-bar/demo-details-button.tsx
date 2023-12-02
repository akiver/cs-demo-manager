import React from 'react';
import { useSelectedDemosPaths } from 'csdm/ui/demos/use-selected-demos-paths';
import { useDemosLoaded } from 'csdm/ui/demos/use-demos-loaded';
import { useNavigateToDemo } from 'csdm/ui/hooks/use-navigate-to-demo';
import { DetailsButton } from 'csdm/ui/components/buttons/details-button';

export function DemoDetailsButton() {
  const navigateToDemo = useNavigateToDemo();
  const selectedDemosPaths = useSelectedDemosPaths();
  const demosLoaded = useDemosLoaded();

  if (selectedDemosPaths.length === 0) {
    return null;
  }

  const onClick = () => {
    const demoPath = selectedDemosPaths[selectedDemosPaths.length - 1];
    navigateToDemo(demoPath);
  };

  return <DetailsButton onClick={onClick} isDisabled={!demosLoaded} />;
}
