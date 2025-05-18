import React from 'react';
import { Content } from 'csdm/ui/components/content';
import { TeamSideStats } from './side/team-side-stats';
import { TeamBombsStats } from './bombs/team-bombs-stats';
import { TeamsRoundOutcomesByEconomyTypeChart } from '../economy/teams-round-outcomes-by-economy-type-chart';
import { useTeam } from '../use-team';

export function TeamPerformance() {
  const { economyStats } = useTeam();

  return (
    <Content>
      <div className="flex flex-col gap-16">
        <TeamSideStats />
        <TeamsRoundOutcomesByEconomyTypeChart economyStats={[economyStats]} showTeamName={false} />
        <TeamBombsStats />
      </div>
    </Content>
  );
}
