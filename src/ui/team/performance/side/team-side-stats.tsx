import React from 'react';
import { Trans } from '@lingui/react/macro';
import { TeamSideMatchChart } from './team-side-match-stats';
import { TeamMatchResultCtChart } from './team-match-result-ct-chart';
import { TeamMatchResultTerroChart } from './team-match-result-terro-chart';
import { Section } from 'csdm/ui/components/section';
import { PlayerIcon } from 'csdm/ui/icons/player-icon';

export function TeamSideStats() {
  return (
    <Section
      title={<Trans context="Panel title">Side</Trans>}
      icon={<PlayerIcon className="size-16" aria-hidden="true" />}
    >
      <div className="flex flex-wrap gap-12">
        <TeamSideMatchChart />
        <TeamMatchResultCtChart />
        <TeamMatchResultTerroChart />
      </div>
    </Section>
  );
}
