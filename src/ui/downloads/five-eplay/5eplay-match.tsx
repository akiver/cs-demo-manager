import React from 'react';
import type { FiveEPlayMatch } from 'csdm/common/types/5eplay-match';
import { FiveEPlayScoreboard } from './5eplay-scoreboard';

type Props = {
  match: FiveEPlayMatch;
};

export function FiveEPlayMatch({ match }: Props) {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-16">
      <div className="my-8 flex flex-col gap-y-8">
        {match.teams.map((team, index) => {
          const oppositeTeam = index === 0 && match.teams.length > 1 ? match.teams[1] : match.teams[0];
          const players = match.players.filter((player) => {
            return team.playerIds.includes(player.uid);
          });

          return (
            <FiveEPlayScoreboard
              key={team.name}
              teamName={team.name}
              teamScore={team.score}
              scoreOppositeTeam={oppositeTeam.score}
              players={players}
            />
          );
        })}
      </div>
    </div>
  );
}
