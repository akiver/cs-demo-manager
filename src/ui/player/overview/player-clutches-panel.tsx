import React from 'react';
import { ClutchesPanel } from 'csdm/ui/components/panels/clutches-panel';
import { usePlayer } from '../use-player';

export function PlayerClutchesPanel() {
  const { clutches } = usePlayer();

  return <ClutchesPanel clutches={clutches} />;
}
