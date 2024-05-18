import React from 'react';
import { TeamTabs } from './team-tabs';
import { TeamActionBar } from './team-action-bar';
import { TeamLoader } from './team-loader';

export function Team() {
  return (
    <>
      <TeamTabs />
      <TeamActionBar />
      <TeamLoader />
    </>
  );
}
