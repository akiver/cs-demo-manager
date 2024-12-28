import React from 'react';
import { FiveEPlayActionBar } from './5eplay-action-bar';
import { FiveEPlayLastMatchesLoader } from './5eplay-last-matches-loader';

export function FiveEPlayLastMatches() {
  return (
    <>
      <FiveEPlayActionBar />
      <FiveEPlayLastMatchesLoader />
    </>
  );
}
