import React from 'react';
import { Plural } from '@lingui/react/macro';
import { getSequencesDuration } from './get-sequences-duration';
import type { Sequence } from 'csdm/common/types/sequence';

type Props = {
  sequences: Sequence[];
  tickrate: number;
};

export function SequencesDuration({ sequences, tickrate }: Props) {
  const duration = getSequencesDuration(sequences, tickrate);

  return (
    <span>
      <Plural value={duration} zero={'0 seconds'} one={'1 second'} other={'# seconds'} />
    </span>
  );
}
