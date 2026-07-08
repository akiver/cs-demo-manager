import { describe, it, expect } from 'vite-plus/test';
import type { Sequence } from 'csdm/common/types/sequence';
import { sortSequencesByStartTick } from './sort-sequences-by-start-tick';

describe('sortSequencesByStartTick', () => {
  it('should sort sequences by start tick', () => {
    const sequences = [
      { number: 1, startTick: 300 },
      { number: 2, startTick: 100 },
      { number: 3, startTick: 200 },
    ] as Sequence[];

    const sortedSequences = sortSequencesByStartTick(sequences);

    expect(sortedSequences.map((sequence) => sequence.number)).toEqual([2, 3, 1]);
  });

  it('should sort sequences with the same start tick by number', () => {
    const sequences = [
      { number: 3, startTick: 100 },
      { number: 1, startTick: 100 },
      { number: 2, startTick: 50 },
    ] as Sequence[];

    const sortedSequences = sortSequencesByStartTick(sequences);

    expect(sortedSequences.map((sequence) => sequence.number)).toEqual([2, 1, 3]);
  });
});
