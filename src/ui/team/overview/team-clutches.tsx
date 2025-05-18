import React from 'react';
import { Clutches } from 'csdm/ui/components/panels/clutches';
import { useTeam } from '../use-team';

export function TeamClutches() {
  const { clutches } = useTeam();

  return <Clutches clutches={clutches} />;
}
