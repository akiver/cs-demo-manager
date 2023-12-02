import React from 'react';
import { RefreshButton } from 'csdm/ui/components/buttons/refresh-button';
import { useDemosLoaded } from 'csdm/ui/demos/use-demos-loaded';
import { useFetchDemos } from 'csdm/ui/demos/use-fetch-demos';

export function RefreshDemosButton() {
  const fetchDemos = useFetchDemos();
  const demosLoaded = useDemosLoaded();

  return <RefreshButton isDisabled={!demosLoaded} onClick={fetchDemos} />;
}
