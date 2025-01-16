import React from 'react';
import { useSequenceForm } from './use-sequence-form';
import { DeathNoticesDurationInput } from '../death-notices-duration-input';

export function SequenceDeathNoticesDurationInput() {
  const { sequence, updateSequence } = useSequenceForm();

  const onBlur = (duration: number) => {
    updateSequence({
      deathNoticesDuration: duration,
    });
  };

  return <DeathNoticesDurationInput value={sequence.deathNoticesDuration} onBlur={onBlur} />;
}
