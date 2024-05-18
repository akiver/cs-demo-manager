import React from 'react';
import { ClutchesPanel } from 'csdm/ui/components/panels/clutches-panel';
import { useTeam } from '../use-team';

export function TeamClutchesPanel() {
  const { clutches } = useTeam();

  return <ClutchesPanel clutches={clutches} />;
}
