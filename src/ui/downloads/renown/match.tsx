import React from 'react';
import { Scoreboard } from './scoreboard';
import type { RenownMatch } from 'csdm/common/types/renown-match';

type Props = {
  match: RenownMatch;
};

export function Match({ match }: Props) {
  const isOnLeetify = match.leetifyMatchUrl !== null;
  return (
    <div className="flex flex-1 flex-col overflow-auto p-16">
      <div className="my-8 flex flex-col gap-y-8">
        <Scoreboard
          teamName={match.team1.name}
          teamScore={match.team1.score}
          scoreOppositeTeam={match.team2.score}
          players={match.players.filter((player) => player.teamName === 'team1')}
          isOnLeetify={isOnLeetify}
        />

        <Scoreboard
          teamName={match.team2.name}
          teamScore={match.team2.score}
          scoreOppositeTeam={match.team1.score}
          players={match.players.filter((player) => player.teamName === 'team2')}
          isOnLeetify={isOnLeetify}
        />
      </div>
    </div>
  );
}
