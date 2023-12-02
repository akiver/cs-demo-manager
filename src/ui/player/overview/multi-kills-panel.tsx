import React from 'react';
import { MultiKillsPanel as CommonMultiKillsPanel } from 'csdm/ui/components/panels/multi-kills-panel';
import { usePlayer } from '../use-player';

export function MultiKillsPanel() {
  const { oneKillCount, twoKillCount, threeKillCount, fourKillCount, fiveKillCount } = usePlayer();

  return (
    <CommonMultiKillsPanel
      oneKillCount={oneKillCount}
      twoKillCount={twoKillCount}
      threeKillCount={threeKillCount}
      fourKillCount={fourKillCount}
      fiveKillCount={fiveKillCount}
    />
  );
}
