import path from 'node:path';
import fs from 'fs-extra';
import type { Sequence } from 'csdm/common/types/sequence';
import { getSequenceOutputFilePath } from 'csdm/node/video/generation/get-sequence-output-file-path';
import { executeFfmpeg } from 'csdm/node/video/ffmpeg/execute-ffmpeg';
import type { VideoContainer } from 'csdm/common/types/video-container';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';

type ConcatenateVideoOptions = {
  sequences: Sequence[];
  outputFolderPath: string;
  videoContainer: VideoContainer;
};

export async function concatenateVideosFromSequences(
  { sequences, outputFolderPath, videoContainer }: ConcatenateVideoOptions,
  signal: AbortSignal,
) {
  const videoPaths = sequences.map((sequence) => {
    return getSequenceOutputFilePath(outputFolderPath, sequence, videoContainer);
  });
  const listFilePath = path.join(getAppFolderPath(), 'videos.txt');
  await fs.writeFile(
    listFilePath,
    videoPaths
      .map((path) => {
        return `file '${path}'`;
      })
      .join('\n'),
    'utf8',
  );

  const args = [
    '-y', // override the file if it exists
    '-f concat',
    '-safe 0',
    `-i "${listFilePath}"`,
    '-c copy',
    `"${path.join(outputFolderPath, `output.${videoContainer}`)}"`,
  ];
  await executeFfmpeg(args, signal);

  await Promise.all(videoPaths.map((videoPath) => fs.remove(videoPath)));
}
