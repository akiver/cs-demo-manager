import type { Sequence } from 'csdm/common/types/sequence';
import { deleteSequenceRawFiles } from 'csdm/node/video/sequences/delete-sequence-raw-files';

export async function deleteSequencesRawFiles(rawFilesFolderPath: string, sequences: Sequence[]) {
  for (const sequence of sequences) {
    await deleteSequenceRawFiles(rawFilesFolderPath, sequence);
  }
}
