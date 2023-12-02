import React from 'react';
import { Content } from 'csdm/ui/components/content';
import type { Player } from 'csdm/common/types/player';
import { MatchActionBar } from './action-bar/action-bar';
import { RoundsTimeline } from './scoreboard/rounds-timeline';
import { Scoreboard } from './scoreboard/scoreboard';
import { MatchInformation } from './scoreboard/match-information';
import { useCurrentMatch } from '../use-current-match';

export function MatchOverview() {
  const match = useCurrentMatch();
  const playersTeamA: Player[] = match.players.filter((player) => player.teamName === match.teamA.name);
  const playersTeamB: Player[] = match.players.filter((player) => player.teamName === match.teamB.name);
  const isDefuseMap = match.mapName.startsWith('de_');

  return (
    <>
      <MatchActionBar />
      <Content>
        <MatchInformation match={match} />
        <div className="flex flex-col">
          <Scoreboard
            teamName={match.teamA.name}
            players={playersTeamA}
            score={match.teamA.score}
            scoreOppositeTeam={match.teamB.score}
            isDefuseMap={isDefuseMap}
          />
          <RoundsTimeline rounds={match.rounds} />
          <Scoreboard
            teamName={match.teamB.name}
            players={playersTeamB}
            score={match.teamB.score}
            scoreOppositeTeam={match.teamA.score}
            isDefuseMap={isDefuseMap}
          />
        </div>
      </Content>
    </>
  );
}
