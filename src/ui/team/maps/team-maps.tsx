import React from 'react';
import { useTeam } from '../use-team';
import { MapsStats } from 'csdm/ui/components/maps-stats';

export function TeamMaps() {
  const { mapsStats } = useTeam();

  return <MapsStats mapsStats={mapsStats} />;
}
