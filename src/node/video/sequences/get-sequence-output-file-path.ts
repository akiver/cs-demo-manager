import path from 'node:path';
import type { Sequence } from 'csdm/common/types/sequence';

export function getSequenceOutputFilePath(outputFolderPath: string, sequence: Sequence) {
  return path.join(
    outputFolderPath,
    `sequence-${sequence.number}-tick-${sequence.startTick}-to-${sequence.endTick}.avi`,
  );
}
