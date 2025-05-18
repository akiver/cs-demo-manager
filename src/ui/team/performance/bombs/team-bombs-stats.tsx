import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Section } from 'csdm/ui/components/section';
import { TeamBombPlantChart } from './team-bomb-plant-chart';
import { TeamEnemyBombPlantRoundOutcomeChart, TeamBombPlantRoundOutcomeChart } from './team-bomb-round-outcome-chart';
import { BombIcon } from 'csdm/ui/icons/weapons/bomb-icon';

export function TeamBombsStats() {
  return (
    <Section
      title={<Trans context="Panel title">Bombs</Trans>}
      icon={<BombIcon className="size-16" aria-hidden="true" />}
    >
      <div className="flex flex-wrap gap-12">
        <TeamBombPlantChart />
        <TeamBombPlantRoundOutcomeChart />
        <TeamEnemyBombPlantRoundOutcomeChart />
      </div>
    </Section>
  );
}
