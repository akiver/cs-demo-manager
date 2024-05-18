import React from 'react';
import { WinRatePanel } from 'csdm/ui/components/panels/win-rate-panel';
import { usePlayer } from '../use-player';

export function PlayerWinRatePanel() {
  const { matchCount, wonMatchCount, lostMatchCount, tiedMatchCount } = usePlayer();

  return (
    <WinRatePanel
      matchCount={matchCount}
      wonMatchCount={wonMatchCount}
      lostMatchCount={lostMatchCount}
      tiedMatchCount={tiedMatchCount}
    />
  );
}
