import React from 'react';
import { Clutches } from 'csdm/ui/components/panels/clutches';
import { usePlayer } from '../use-player';

export function PlayerClutches() {
  const { clutches } = usePlayer();

  return <Clutches clutches={clutches} />;
}
