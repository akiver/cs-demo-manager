import path from 'node:path';
import fs from 'fs-extra';
import { glob } from 'csdm/node/filesystem/glob';
import { Game } from 'csdm/common/types/counter-strike';
import type { Sequence } from 'csdm/common/types/sequence';
import { getSequenceName } from 'csdm/node/video/generation/get-sequence-name';
import { RawFilesNotFoundError } from 'csdm/node/video/errors/raw-files-not-found';
import { WavFileNotFound } from 'csdm/node/video/errors/wav-file-not-found';
import { RecordingOutput } from 'csdm/common/types/recording-output';
import type { VideoContainer } from 'csdm/common/types/video-container';
import { RecordingSystem } from 'csdm/common/types/recording-system';
import { getCsgoFolderPathOrThrow } from 'csdm/node/counter-strike/get-csgo-folder-path';
import { getSequenceOutputFolderPath } from './get-sequence-output-folder-path';

async function assertWavFileExists(wavFilePath: string) {
  const exists = await fs.pathExists(wavFilePath);
  if (!exists) {
    throw new WavFileNotFound();
  }
}

async function assertVideoFileExists(videoFilePath: string) {
  const exists = await fs.pathExists(videoFilePath);
  if (!exists) {
    throw new RawFilesNotFoundError();
  }
}

async function assertFolderExists(folderPath: string) {
  const exists = await fs.pathExists(folderPath);
  if (!exists) {
    logger.error(`Folder does not exist ${folderPath}`);
    throw new RawFilesNotFoundError();
  }
}

function assertPathsNotEmpty(paths: string[]) {
  if (paths.length === 0) {
    throw new RawFilesNotFoundError();
  }
}

export async function getHlaeTakeFolderPath(sequenceOutputFolderPath: string) {
  const takeFolders = await glob(`take*`, {
    cwd: sequenceOutputFolderPath,
    absolute: true,
    onlyDirectories: true,
    deep: 1,
  });
  assertPathsNotEmpty(takeFolders);

  const takeFolderPath = takeFolders[takeFolders.length - 1];
  await assertFolderExists(takeFolderPath);

  return takeFolderPath;
}

type RawFiles = { tgaFiles: string[]; wavFilePath: string; videoFilePath: string | null };

type GetHlaeRawFilesOptions = {
  sequence: Sequence;
  game: Game;
  outputFolderPath: string;
  recordingOutput: RecordingOutput;
  videoContainer: VideoContainer;
};

// Example C2 folder structure:
// └── 1-sequence/
//     ├── video.avi
//     └── take0000/
//         ├── 00000.tga
//         ├── 00001.tga
//         └── audio.wav
// Example CS:GO folder structure:
// └── 1-sequence/
//     ├── video.avi
//     └── take0000/
//         ├── audio.wav
//         └── defaultNormal/
//             ├── 00000.tga
//             └── 00001.tga
//
// ! The TGA files are generated only when the output is set to "Images" or "Images and video".
// ! The video.avi file is generated only when the output is set to "Video".
async function getHlaeRawFiles({
  sequence,
  game,
  outputFolderPath,
  recordingOutput,
  videoContainer,
}: GetHlaeRawFilesOptions): Promise<RawFiles> {
  const sequenceOutputFolderPath = getSequenceOutputFolderPath(sequence, outputFolderPath);
  await assertFolderExists(sequenceOutputFolderPath);

  const takeFolderPath = await getHlaeTakeFolderPath(sequenceOutputFolderPath);
  const wavFilePath = path.resolve(takeFolderPath, 'audio.wav');
  await assertWavFileExists(wavFilePath);

  if (recordingOutput === RecordingOutput.Video) {
    const videoFilePath = path.resolve(sequenceOutputFolderPath, `video.${videoContainer}`);
    await assertVideoFileExists(videoFilePath);

    return { tgaFiles: [], wavFilePath, videoFilePath };
  }

  const isCsgo = game === Game.CSGO;
  const tgaFiles = await glob(isCsgo ? 'defaultNormal/*.tga' : '*.tga', {
    cwd: takeFolderPath,
    absolute: true,
  });
  assertPathsNotEmpty(tgaFiles);

  return { tgaFiles, wavFilePath, videoFilePath: null };
}

type GetStartMovieRawFilesOptions = {
  sequence: Sequence;
  game: Game;
};

export async function getStartMovieRawFiles({ sequence, game }: GetStartMovieRawFilesOptions): Promise<RawFiles> {
  const isCsgo = game === Game.CSGO;
  const csgoFolderPath = await getCsgoFolderPathOrThrow(game);
  let recordingFolderPath: string;
  if (isCsgo) {
    recordingFolderPath = path.join(csgoFolderPath, 'csgo');
  } else {
    // The "movie" folder is inside our plugin folder
    recordingFolderPath = path.join(csgoFolderPath, 'game', 'csgo', 'csdm', 'movie');
  }
  await assertFolderExists(recordingFolderPath);

  const sequenceName = getSequenceName(sequence);
  const tgaFiles = await glob(`**/${sequenceName}*.tga`, {
    cwd: recordingFolderPath,
    followSymbolicLinks: false,
    absolute: true,
    onlyFiles: true,
  });
  assertPathsNotEmpty(tgaFiles);

  const rawFilesFolderPath = path.dirname(tgaFiles[0]);

  let wavFileFolderPath = rawFilesFolderPath;
  if (!isCsgo) {
    // Since the "Armory" update the wav files are created inside csgo/movie instead of csgo/csdm/movie.
    // Remove the last occurrence of "/csdm/" to get the correct path.
    wavFileFolderPath = rawFilesFolderPath.replace(/csdm\/(?!.*csdm\/)/, '');
  }

  const wavFilePath = path.join(wavFileFolderPath, isCsgo ? `${sequenceName}.WAV` : `${sequenceName}.wav`);
  await assertWavFileExists(wavFilePath);

  return { tgaFiles, wavFilePath, videoFilePath: null };
}

type Options = {
  recordingSystem: RecordingSystem;
  recordingOutput: RecordingOutput;
  sequence: Sequence;
  game: Game;
  outputFolderPath: string;
  videoContainer: VideoContainer;
};

export async function getSequenceRawFiles({
  recordingSystem,
  recordingOutput,
  videoContainer,
  sequence,
  game,
  outputFolderPath,
}: Options): Promise<RawFiles> {
  if (recordingSystem === RecordingSystem.HLAE) {
    return await getHlaeRawFiles({
      sequence,
      game,
      recordingOutput,
      videoContainer,
      outputFolderPath,
    });
  }

  return await getStartMovieRawFiles({ sequence, game });
}
