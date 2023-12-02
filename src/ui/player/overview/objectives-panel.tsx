import React from 'react';
import { ObjectivesPanel as CommonObjectivesPanel } from 'csdm/ui/components/panels/objectives-panel';
import { usePlayer } from '../use-player';

export function ObjectivesPanel() {
  const { bombDefusedCount, bombPlantedCount, hostageRescuedCount } = usePlayer();

  return (
    <CommonObjectivesPanel
      bombDefusedCount={bombDefusedCount}
      bombPlantedCount={bombPlantedCount}
      hostageRescuedCount={hostageRescuedCount}
    />
  );
}
