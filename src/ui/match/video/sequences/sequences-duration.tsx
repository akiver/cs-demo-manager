import React from 'react';
import { Plural } from '@lingui/macro';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { roundNumber } from 'csdm/common/math/round-number';
import { useCurrentMatchSequences } from './use-current-match-sequences';

function useComputeSequencesDuration() {
  const sequences = useCurrentMatchSequences();
  const match = useCurrentMatch();

  let duration = 0;
  for (const sequence of sequences) {
    duration += (sequence.endTick - sequence.startTick) / match.tickrate;
  }

  return roundNumber(duration);
}

export function SequencesDuration() {
  const duration = useComputeSequencesDuration();

  return (
    <span>
      <Plural value={duration} zero={'0 seconds'} one={'1 second'} other={'# seconds'} />
    </span>
  );
}
