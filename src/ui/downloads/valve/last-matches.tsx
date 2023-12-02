import React from 'react';
import { ActionBar } from './action-bar';
import { Sidebar } from './sidebar';
import { CurrentMatch } from './current-match';

export function LastMatches() {
  return (
    <>
      <ActionBar />
      <div className="flex overflow-hidden">
        <Sidebar />
        <CurrentMatch />
      </div>
    </>
  );
}
