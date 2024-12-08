import React from 'react';
import { Trans } from '@lingui/react/macro';
import { roundNumber } from 'csdm/common/math/round-number';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { useSequenceForm } from './use-sequence-form';

export function SequenceDuration() {
  const { sequence } = useSequenceForm();
  const match = useCurrentMatch();
  let seconds = 0;
  const startTick = Number(sequence.startTick);
  const endTick = Number(sequence.endTick);
  if (endTick > startTick) {
    seconds = roundNumber((endTick - startTick) / match.tickrate);
  }

  return (
    <div className="flex gap-x-4">
      <span>
        <Trans context="Duration">
          <strong>{seconds}</strong> seconds
        </Trans>
      </span>
    </div>
  );
}
