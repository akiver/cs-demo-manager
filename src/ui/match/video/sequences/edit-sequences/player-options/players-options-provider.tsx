import React, { useState, createContext } from 'react';
import type { ReactNode } from 'react';
import type { SequencePlayerOptions } from 'csdm/common/types/sequence-player-options';
import type { Match } from 'csdm/common/types/match';

type SequencePlayerOptionsContextState = {
  options: SequencePlayerOptions[];
  update: (options: SequencePlayerOptions[]) => void;
};

export const SequencePlayersOptionsContext = createContext<SequencePlayerOptionsContextState>({
  options: [],
  update: () => {
    throw new Error('update is not implemented');
  },
});

type Props = {
  children: ReactNode;
  match: Match;
};

export function SequencePlayersOptionsProvider({ children, match }: Props) {
  const [options, update] = useState<SequencePlayerOptions[]>(() => {
    return match.players.map((player) => {
      return {
        steamId: player.steamId,
        playerName: player.name,
        showKill: true,
        highlightKill: false,
        isVoiceEnabled: true,
      };
    });
  });

  return (
    <SequencePlayersOptionsContext
      value={{
        options,
        update,
      }}
    >
      {children}
    </SequencePlayersOptionsContext>
  );
}
