import React from 'react';
import { Trans } from '@lingui/react/macro';
import { roundNumber } from 'csdm/common/math/round-number';
import { useSequenceForm } from '../sequence/use-sequence-form';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { useComputeRequiredBytes } from '../sequences/use-compute-require-bytes';

function useComputeRequiredDiskSpace() {
  const { sequence } = useSequenceForm();
  const match = useCurrentMatch();
  const computeRequiredGigabyte = useComputeRequiredBytes();

  const bytes = computeRequiredGigabyte(Number(sequence.startTick), Number(sequence.endTick), match.tickrate);

  return roundNumber(bytes / (1024 * 1024 * 1024), 2);
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
