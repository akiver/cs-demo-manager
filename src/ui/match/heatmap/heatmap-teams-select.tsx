import React from 'react';
import { TeamsSelect } from 'csdm/ui/components/inputs/select/teams-select';
import { useCurrentMatch } from '../use-current-match';
import { useHeatmapContext } from './heatmap-context';

export function HeatmapTeamsSelect() {
  const match = useCurrentMatch();
  const { teamNames, fetchPointsAndDraw } = useHeatmapContext();

  return (
    <TeamsSelect
      teamNameA={match.teamA.name}
      teamNameB={match.teamB.name}
      selectedTeamNames={teamNames}
      onChange={(teamName: string | undefined) => {
        fetchPointsAndDraw({ teamNames: teamName ? [teamName] : [] });
      }}
    />
  );
}
