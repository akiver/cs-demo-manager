import fs from 'fs-extra';
import type { Sequence } from 'csdm/common/types/sequence';
import { getSequenceOutputFilePath } from 'csdm/node/video/sequences/get-sequence-output-file-path';

export async function deleteSequencesOutputFile(outputFolderPath: string, sequences: Sequence[]) {
  for (const sequence of sequences) {
    const sequenceOutputFilePath = getSequenceOutputFilePath(outputFolderPath, sequence);
    await fs.remove(sequenceOutputFilePath);
  }
}
