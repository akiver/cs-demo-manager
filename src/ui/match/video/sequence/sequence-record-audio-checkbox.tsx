import React from 'react';
import { useSequenceForm } from './use-sequence-form';
import { RecordAudioCheckbox } from '../record-audio-checkbox';

export function SequenceRecordAudioCheckbox() {
  const { sequence, updateSequence } = useSequenceForm();

  return (
    <RecordAudioCheckbox
      defaultChecked={sequence.recordAudio}
      onChange={(isChecked) => {
        updateSequence({
          recordAudio: isChecked,
        });
      }}
    />
  );
}
