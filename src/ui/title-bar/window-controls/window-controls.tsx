import React from 'react';
import { MaximizeControl } from './maximize-control';
import { MinimizeControl } from './minimize-control';
import { CloseControl } from './close-control';

export function WindowControls() {
  return (
    <div className="z-10 flex h-full items-center no-drag">
      <MinimizeControl />
      <MaximizeControl />
      <CloseControl />
    </div>
  );
}
