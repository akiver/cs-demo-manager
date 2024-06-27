import React from 'react';
import { Trans } from '@lingui/macro';
import { roundNumber } from 'csdm/common/math/round-number';
import { useComputeRequiredGigabyte } from './use-compute-require-gigabyte';
import { useSequenceForm } from './use-sequence-form';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';

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
      <Trans>~{requiredDiskSpace}GB</Trans>
    </span>
  );
}
