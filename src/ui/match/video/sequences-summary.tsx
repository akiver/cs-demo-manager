import React from 'react';
import { Plural } from '@lingui/react/macro';
import { useCurrentMatchSequences } from './sequences/use-current-match-sequences';
import { SequencesDuration } from './sequences/sequences-duration';
import { SequencesDiskSpace } from './sequences/sequences-disk-space';
import { useCurrentMatch } from '../use-current-match';

function Separator() {
  return <span>|</span>;
}

export function SequencesSummary() {
  const sequences = useCurrentMatchSequences();
  const match = useCurrentMatch();

  return (
    <div className="flex gap-x-4">
      <p>
        <Plural value={sequences.length} one="# sequence" other="# sequences" />
      </p>
      <Separator />
      <SequencesDuration sequences={sequences} tickrate={match.tickrate} />
      <Separator />
      <SequencesDiskSpace />
    </div>
  );
}
