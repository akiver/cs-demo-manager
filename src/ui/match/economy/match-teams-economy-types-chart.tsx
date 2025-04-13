import React from 'react';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { TeamsEconomyTypesChart } from 'csdm/ui/team/economy/teams-economy-types-chart';

export function MatchTeamsEconomyTypesChart() {
  const match = useCurrentMatch();

  return <TeamsEconomyTypesChart economyStats={match.teamsEconomyStats} />;
}
