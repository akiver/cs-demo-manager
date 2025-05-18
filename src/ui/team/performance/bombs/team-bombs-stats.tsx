import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Section } from 'csdm/ui/components/section';
import { TeamBombPlantChart } from './team-bomb-plant-chart';
import { TeamEnemyBombPlantRoundOutcomeChart, TeamBombPlantRoundOutcomeChart } from './team-bomb-round-outcome-chart';

export function TeamBombsStats() {
  return (
    <Section title={<Trans context="Panel title">Bombs</Trans>}>
      <div className="flex flex-wrap gap-12">
        <TeamBombPlantChart />
        <TeamBombPlantRoundOutcomeChart />
        <TeamEnemyBombPlantRoundOutcomeChart />
      </div>
    </Section>
  );
}
