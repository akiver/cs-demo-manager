import React, { useState, createContext } from 'react';
import type { ReactNode } from 'react';
import type { DeathNoticesPlayerOptions } from 'csdm/common/types/death-notice-player-options';
import type { Match } from 'csdm/common/types/match';

type DeathNoticesContextState = {
  deathNotices: DeathNoticesPlayerOptions[];
  updateDeathNotices: (deathNotices: DeathNoticesPlayerOptions[]) => void;
};

export const DeathNoticesContext = createContext<DeathNoticesContextState>({
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
        deathNotices,
        updateDeathNotices: setDeathNotices,
      }}
    >
      {children}
    </DeathNoticesContext.Provider>
  );
}
