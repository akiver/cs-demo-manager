import React from 'react';
import { useCurrentMatch } from '../../use-current-match';
import { getSequencePlayerColor } from './get-sequence-player-color';

export function PlayersColors() {
  const match = useCurrentMatch();

  return (
    <div className="flex items-center gap-y-4 gap-x-12 mb-4">
      {match.players.map((player, index) => {
        return (
          <div className="flex items-center gap-x-4" key={player.steamId}>
            <div className="size-12 rounded-full" style={{ backgroundColor: getSequencePlayerColor(index) }} />
            <p>{player.name}</p>
          </div>
        );
      })}
    </div>
  );
}
