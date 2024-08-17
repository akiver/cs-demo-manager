import React, { useState, createContext } from 'react';
import type { ReactNode } from 'react';
import type { DeathNoticesPlayerOptions } from 'csdm/common/types/death-notice-player-options';
import type { Match } from 'csdm/common/types/match';
import { Game } from 'csdm/common/types/counter-strike';

type DeathNoticesContextState = {
  game: Game;
  deathNotices: DeathNoticesPlayerOptions[];
  updateDeathNotices: (deathNotices: DeathNoticesPlayerOptions[]) => void;
};

export const DeathNoticesContext = createContext<DeathNoticesContextState>({
  game: Game.CS2,
  deathNotices: [],
  updateDeathNotices: () => {
    throw new Error('updateDeathNotices is not implemented');
  },
});

type Props = {
  children: ReactNode;
  match: Match;
};

export function DeathNoticesProvider({ children, match }: Props) {
  const [deathNotices, setDeathNotices] = useState<DeathNoticesPlayerOptions[]>(() => {
    return match.players.map((player) => {
      return {
        steamId: player.steamId,
        playerName: player.name,
        showKill: true,
        highlightKill: false,
      };
    });
  });

  return (
    <DeathNoticesContext.Provider
      value={{
        game: match.game,
        deathNotices,
        updateDeathNotices: setDeathNotices,
      }}
    >
      {children}
    </DeathNoticesContext.Provider>
  );
}
