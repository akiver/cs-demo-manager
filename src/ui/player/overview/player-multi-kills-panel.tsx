import React from 'react';
import { MultiKillsPanel } from 'csdm/ui/components/panels/multi-kills-panel';
import { usePlayer } from '../use-player';

export function PlayerMultiKillsPanel() {
  const { oneKillCount, twoKillCount, threeKillCount, fourKillCount, fiveKillCount } = usePlayer();

  return (
    <MultiKillsPanel
      oneKillCount={oneKillCount}
      twoKillCount={twoKillCount}
      threeKillCount={threeKillCount}
      fourKillCount={fourKillCount}
      fiveKillCount={fiveKillCount}
    />
  );
}
