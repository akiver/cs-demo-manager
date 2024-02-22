import React from 'react';
import { Trans } from '@lingui/macro';
import { useSequencesRequiredDiskSpace } from './use-sequences-required-disk-space';

export function SequencesDiskSpace() {
  const requiredDiskSpace = useSequencesRequiredDiskSpace();
  const minimumGigabyteWarning = 20;

  return (
    <span className={requiredDiskSpace >= minimumGigabyteWarning ? 'text-red-600' : undefined}>
      <Trans context="Disk usage in gigabyte">~{requiredDiskSpace}GB</Trans>
    </span>
  );
}
