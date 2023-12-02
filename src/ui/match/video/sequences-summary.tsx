import React from 'react';
import { Plural } from '@lingui/macro';
import { useCurrentMatchSequences } from './sequences/use-current-match-sequences';
import { SequencesDuration } from './sequences/sequences-duration';
import { SequencesDiskSpace } from './sequences/sequences-disk-space';

function Separator() {
  return <span>|</span>;
}

export function SequencesSummary() {
  const sequences = useCurrentMatchSequences();

  return (
    <div className="flex gap-x-4">
      <p>
        <Plural value={sequences.length} one="# sequence" other="# sequences" />
      </p>
      <Separator />
      <SequencesDuration />
      <Separator />
      <SequencesDiskSpace />
    </div>
  );
}
