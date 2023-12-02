import React from 'react';
import { ActionBar } from './action-bar';
import { LastMatchesLoader } from './last-matches-loader';

export function LastMatches() {
  return (
    <>
      <ActionBar />
      <LastMatchesLoader />
    </>
  );
}
