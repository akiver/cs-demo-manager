import React from 'react';
import { Trans } from '@lingui/macro';
import { roundNumber } from 'csdm/common/math/round-number';
import { useComputeRequiredGigabyte } from './use-compute-require-gigabyte';
import { useCurrentMatchSequences } from './use-current-match-sequences';

function useComputeRequiredDiskSpace() {
  const sequences = useCurrentMatchSequences();
  const computeRequiredGigabyte = useComputeRequiredGigabyte();

  let diskSpace = 0;
  for (const sequence of sequences) {
    diskSpace += computeRequiredGigabyte(sequence.startTick, sequence.endTick);
  }

  return roundNumber(diskSpace, 2);
}

export function SequencesDiskSpace() {
  const requiredDiskSpace = useComputeRequiredDiskSpace();
  const minimumGigabyteWarning = 20;

  return (
    <span className={requiredDiskSpace >= minimumGigabyteWarning ? 'text-red-600' : undefined}>
      <Trans context="Disk usage in gigabyte">~{requiredDiskSpace}GB</Trans>
    </span>
  );
}
