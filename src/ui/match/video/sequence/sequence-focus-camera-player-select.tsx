import React from 'react';
import { useSequenceForm } from './use-sequence-form';
import { FocusCameraPlayerSelect } from '../focus-camera-player-select';

export function SequenceFocusCameraPlayerSelect() {
  const { sequence, updateSequence } = useSequenceForm();

  return (
    <FocusCameraPlayerSelect
      playerFocusSteamId={sequence.playerFocusSteamId}
      onChange={(steamId) => {
        updateSequence({
          playerFocusSteamId: steamId,
        });
      }}
    />
  );
}
