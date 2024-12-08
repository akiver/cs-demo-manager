import React from 'react';
import { Trans } from '@lingui/react/macro';
import { roundNumber } from 'csdm/common/math/round-number';
import { useSequenceForm } from '../sequence/use-sequence-form';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { useComputeRequiredGigabyte } from '../sequences/use-compute-require-gigabyte';

function useComputeRequiredDiskSpace() {
  const { sequence } = useSequenceForm();
  const match = useCurrentMatch();
  const computeRequiredGigabyte = useComputeRequiredGigabyte();

  const diskSpace = computeRequiredGigabyte(Number(sequence.startTick), Number(sequence.endTick), match.tickrate);

  return roundNumber(diskSpace, 2);
}

export function SequenceDiskSpace() {
  const requiredDiskSpace = useComputeRequiredDiskSpace();
  const minimumGigabyteWarning = 10;

  return (
    <span className={requiredDiskSpace >= minimumGigabyteWarning ? 'text-red-600' : undefined}>
      <Trans>
        ~<strong>{requiredDiskSpace}</strong>GB
      </Trans>
    </span>
  );
}
