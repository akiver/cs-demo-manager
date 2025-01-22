import React, { useState } from 'react';
import type { Group, Item } from 'csdm/ui/components/timeline/use-timeline';
import { useTimeline } from 'csdm/ui/components/timeline/use-timeline';
import type { Sequence } from 'csdm/common/types/sequence';
import { sortSequencesByStartTick } from 'csdm/common/video/sort-sequences-by-start-tick';
import { useCurrentMatch } from '../../../use-current-match';
import { EditSequenceDialog } from '../../sequence/edit-sequence-dialog';
import { useCurrentMatchSequences } from '../use-current-match-sequences';
import { SequenceItem } from './sequence-item';

function buildSequencesGroup(
  sequences: Sequence[],
  pixelsPerTick: number,
  ticksPerSecond: number,
  setSelectedSequenceOnTimeline: (sequence: Sequence | undefined) => void,
): Group {
  const sortedSequences = sortSequencesByStartTick(sequences);
  const items: Item[] = [];
  let currentY = 0;
  const itemHeight = 120;
  let groupHeight = itemHeight;
  for (let index = 0; index < sortedSequences.length; index++) {
    const sequence = sortedSequences[index];
    const x = sequence.startTick * pixelsPerTick;
    const width = (sequence.endTick - sequence.startTick) * pixelsPerTick;
    const previousSequence = sortedSequences[index - 1];
    if (previousSequence !== undefined) {
      const previousSequenceWidth = (previousSequence.endTick - previousSequence.startTick) * pixelsPerTick;
      const previousSequenceX = previousSequence.startTick * pixelsPerTick;

      if (x < previousSequenceX + previousSequenceWidth) {
        currentY += itemHeight;
        if (currentY >= groupHeight) {
          groupHeight = currentY + itemHeight;
        }
      } else {
        currentY = 0;
      }
    }

    items.push({
      startTick: sequence.startTick,
      endTick: sequence.endTick,
      width,
      x,
      y: currentY,
      height: itemHeight,
      element: (
        <SequenceItem sequence={sequence} ticksPerSecond={ticksPerSecond} onEditClick={setSelectedSequenceOnTimeline} />
      ),
    });
  }

  return {
    id: 'sequences',
    height: groupHeight,
    items,
  };
}

export function SequencesTimeline() {
  const match = useCurrentMatch();
  const sequences = useCurrentMatchSequences();
  const [selectedSequenceOnTimeline, setSelectedSequenceOnTimeline] = useState<Sequence | undefined>(undefined);

  const { wrapperProps, timelineProps, pixelsPerTick, ticksPerSecond, timestampGroup, render } = useTimeline({
    tickCount: match.tickCount,
    ticksPerSecond: match.tickrate,
  });
  const sequencesGroup = buildSequencesGroup(sequences, pixelsPerTick, ticksPerSecond, setSelectedSequenceOnTimeline);

  const groups = [sequencesGroup, timestampGroup];

  return (
    <>
      <div className="flex border border-gray-900">
        <div {...wrapperProps}>
          <div {...timelineProps}>{render(groups)}</div>
        </div>
      </div>
      <EditSequenceDialog
        sequence={selectedSequenceOnTimeline}
        closeDialog={() => setSelectedSequenceOnTimeline(undefined)}
      />
    </>
  );
}
