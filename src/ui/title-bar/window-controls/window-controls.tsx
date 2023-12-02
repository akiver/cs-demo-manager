import React from 'react';
import { MaximizeControl } from './maximize-control';
import { MinimizeControl } from './minimize-control';
import { CloseControl } from './close-control';

export function WindowControls() {
  return (
    <div className="flex items-center h-full no-drag z-10">
      <MinimizeControl />
      <MaximizeControl />
      <CloseControl />
    </div>
  );
}
