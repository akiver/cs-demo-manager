import React from 'react';
import { useSequencesRequiredDiskSpace } from './use-sequences-required-disk-space';
import { RequiredDiskSpace } from './required-disk-space';

export function SequencesDiskSpace() {
  const bytes = useSequencesRequiredDiskSpace();

  return <RequiredDiskSpace bytes={bytes} />;
}
