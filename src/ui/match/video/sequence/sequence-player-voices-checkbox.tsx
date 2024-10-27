import React from 'react';
import { useSequenceForm } from './use-sequence-form';
import { PlayerVoicesCheckbox } from '../player-voices-checkbox';

export function SequencePlayerVoicesCheckbox() {
  const { sequence, updateSequence } = useSequenceForm();

  return (
    <PlayerVoicesCheckbox
      defaultChecked={sequence.playerVoicesEnabled}
      onChange={(isChecked) => {
        updateSequence({
          playerVoicesEnabled: isChecked,
        });
      }}
    />
  );
}
