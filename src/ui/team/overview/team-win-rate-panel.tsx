import React from 'react';
import { WinRatePanel } from 'csdm/ui/components/panels/win-rate-panel';
import { useTeam } from '../use-team';

export function TeamWinRatePanel() {
  const { matchCount, wonMatchCount, lostMatchCount, tiedMatchCount } = useTeam();

  return (
    <WinRatePanel
      matchCount={matchCount}
      wonMatchCount={wonMatchCount}
      lostMatchCount={lostMatchCount}
      tiedMatchCount={tiedMatchCount}
    />
  );
}
