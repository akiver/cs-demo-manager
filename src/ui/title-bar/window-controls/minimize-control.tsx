import React from 'react';
import { Control } from './control';
import { MinimizeIcon } from './minimize-icon';

export function MinimizeControl() {
  const onClick = () => {
    window.csdm.minimizeWindow();
  };

  return (
    <Control onClick={onClick}>
      <MinimizeIcon />
    </Control>
  );
}
