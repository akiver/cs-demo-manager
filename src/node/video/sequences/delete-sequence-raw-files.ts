import path from 'node:path';
import fs from 'fs-extra';
import type { Sequence } from 'csdm/common/types/sequence';
import { getSequenceName } from 'csdm/node/video/sequences/get-sequence-name';

export async function deleteSequenceRawFiles(rawFilesFolderPath: string, sequence: Sequence) {
  const sequenceName = getSequenceName(sequence);
  const sequenceRawFilesFolderPath = path.join(rawFilesFolderPath, sequenceName);
  await fs.remove(sequenceRawFilesFolderPath);
}
