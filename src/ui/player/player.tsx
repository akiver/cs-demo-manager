import React from 'react';
import { PlayerActionBar } from './player-action-bar';
import { PlayerLoader } from './player-loader';
import { PlayerTabs } from './player-tabs';

export function Player() {
  return (
    <>
      <PlayerTabs />
      <PlayerActionBar />
      <PlayerLoader />
    </>
  );
}
