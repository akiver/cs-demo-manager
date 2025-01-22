import path from 'node:path';
import type { Sequence } from 'csdm/common/types/sequence';
import type { VideoContainer } from 'csdm/common/types/video-container';

export function getSequenceOutputFilePath(
  outputFolderPath: string,
  sequence: Sequence,
  videoContainer: VideoContainer,
) {
  return path.join(
    outputFolderPath,
    `sequence-${sequence.number}-tick-${sequence.startTick}-to-${sequence.endTick}.${videoContainer}`,
  );
}
