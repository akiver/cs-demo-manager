import fs from 'fs-extra';
import type { Sequence } from 'csdm/common/types/sequence';
import { getSequenceOutputFilePath } from 'csdm/node/video/sequences/get-sequence-output-file-path';
import type { VideoContainer } from 'csdm/common/types/video-container';

export async function deleteSequencesOutputFile(
  outputFolderPath: string,
  sequences: Sequence[],
  videoContainer: VideoContainer,
) {
  for (const sequence of sequences) {
    const sequenceOutputFilePath = getSequenceOutputFilePath(outputFolderPath, sequence, videoContainer);
    await fs.remove(sequenceOutputFilePath);
  }
}
