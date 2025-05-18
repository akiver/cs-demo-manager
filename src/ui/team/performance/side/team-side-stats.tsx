import React from 'react';
import { Trans } from '@lingui/react/macro';
import { TeamSideMatchChart } from './team-side-match-stats';
import { TeamMatchResultCtChart } from './team-match-result-ct-chart';
import { TeamMatchResultTerroChart } from './team-match-result-terro-chart';
import { Section } from 'csdm/ui/components/section';

export function TeamSideStats() {
  return (
    <Section title={<Trans context="Panel title">Side</Trans>}>
      <div className="flex flex-wrap gap-12">
        <TeamSideMatchChart />
        <TeamMatchResultCtChart />
        <TeamMatchResultTerroChart />
      </div>
    </Section>
  );
}
