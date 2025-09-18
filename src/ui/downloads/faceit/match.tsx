import React from 'react';
import type { FaceitMatch } from 'csdm/common/types/faceit-match';
import { Scoreboard } from './scoreboard';
import { FaceitDownloadsWarning } from 'csdm/ui/settings/downloads/faceit-downloads-warning';

type Props = {
  match: FaceitMatch;
};

export function Match({ match }: Props) {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-16">
      <div className="mx-auto py-8">
        <FaceitDownloadsWarning />
      </div>
      <div className="my-8 flex flex-col gap-y-8">
        {match.teams.map((team, index) => {
          const oppositeTeam = index === 0 && match.teams.length > 1 ? match.teams[1] : match.teams[0];
          const players = match.players.filter((player) => player.teamName === team.name);

          return (
            <Scoreboard
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
