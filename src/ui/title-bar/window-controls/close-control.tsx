import React from 'react';
import { CloseIcon } from './close-icon';
import { Control } from './control';

export function CloseControl() {
  const onClick = () => {
    window.csdm.closeWindow();
  };

  return (
    <Control variant="danger" onClick={onClick}>
      <CloseIcon />
    </Control>
  );
}
