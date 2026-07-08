import { describe, it, expect } from 'vite-plus/test';
import type { Sequence } from 'csdm/common/types/sequence';
import { getNextSequenceNumber } from './get-next-sequence-number';

describe('getNextSequenceNumber', () => {
  it('should return 1 when there are no sequences', () => {
    expect(getNextSequenceNumber([])).toBe(1);
  });

  it('should return the highest sequence number plus 1', () => {
    const sequences = [{ number: 1 }, { number: 4 }, { number: 2 }] as Sequence[];

    expect(getNextSequenceNumber(sequences)).toBe(5);
  });
});
