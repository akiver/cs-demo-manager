import React from 'react';
import { ObjectivesPanel } from 'csdm/ui/components/panels/objectives-panel';
import { useTeam } from '../use-team';

export function TeamObjectivesPanel() {
  const { bombDefusedCount, bombPlantedCount, hostageRescuedCount } = useTeam();

  return (
    <ObjectivesPanel
      bombDefusedCount={bombDefusedCount}
      bombPlantedCount={bombPlantedCount}
      hostageRescuedCount={hostageRescuedCount}
    />
  );
}
