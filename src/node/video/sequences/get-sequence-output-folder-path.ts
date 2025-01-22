import path from 'node:path';
import type { Sequence } from 'csdm/common/types/sequence';
import { getSequenceName } from './get-sequence-name';

export function getSequenceOutputFolderPath(sequence: Sequence, outputFolderPath: string) {
  const sequenceName = getSequenceName(sequence);

  return path.join(outputFolderPath, sequenceName);
}
