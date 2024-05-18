import React from 'react';
import { ObjectivesPanel } from 'csdm/ui/components/panels/objectives-panel';
import { usePlayer } from '../use-player';

export function PlayerObjectivesPanel() {
  const { bombDefusedCount, bombPlantedCount, hostageRescuedCount } = usePlayer();

  return (
    <ObjectivesPanel
      bombDefusedCount={bombDefusedCount}
      bombPlantedCount={bombPlantedCount}
      hostageRescuedCount={hostageRescuedCount}
    />
  );
}
