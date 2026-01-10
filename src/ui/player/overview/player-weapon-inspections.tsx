import React from 'react';
import { usePlayer } from '../use-player';
import { WeaponInspectionsPanel } from 'csdm/ui/components/panels/weapon-inspections-panel';

export function PlayerWeaponInspections() {
  const { inspectWeaponCount, deathWhileInspectingWeaponCount } = usePlayer();

  return (
    <WeaponInspectionsPanel
      inspectionCount={inspectWeaponCount}
      deathWhileInspectingCount={deathWhileInspectingWeaponCount}
    />
  );
}
