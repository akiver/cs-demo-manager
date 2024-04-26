import React from 'react';
import { Content } from 'csdm/ui/components/content';
import { MatchActionBar } from './action-bar/action-bar';
import { RoundsTimeline } from './scoreboard/rounds-timeline';
import { Scoreboard } from './scoreboard/scoreboard';
import { MatchInformation } from './scoreboard/match-information';
import { useCurrentMatch } from '../use-current-match';
import { MatchOverviewProvider } from './match-overview-provider';

export function MatchOverview() {
  const match = useCurrentMatch();

  return (
    <MatchOverviewProvider>
      {({ tableTeamA, tableTeamB }) => {
        return (
          <>
            <MatchActionBar />
            <Content>
              <MatchInformation match={match} />
              <div className="flex flex-col">
                <Scoreboard
                  teamName={match.teamA.name}
                  table={tableTeamA}
                  score={match.teamA.score}
                  scoreOppositeTeam={match.teamB.score}
                />
                <RoundsTimeline rounds={match.rounds} />
                <Scoreboard
                  teamName={match.teamB.name}
                  table={tableTeamB}
                  score={match.teamB.score}
                  scoreOppositeTeam={match.teamA.score}
                />
              </div>
            </Content>
          </>
        );
      }}
    </MatchOverviewProvider>
  );
}
