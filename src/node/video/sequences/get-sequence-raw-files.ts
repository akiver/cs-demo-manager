import path from 'node:path';
import fs from 'fs-extra';
import { glob } from 'csdm/node/filesystem/glob';
import { Game } from 'csdm/common/types/counter-strike';
import type { Sequence } from 'csdm/common/types/sequence';
import { getSequenceName } from 'csdm/node/video/sequences/get-sequence-name';
import { RawFilesNotFoundError } from 'csdm/node/video/errors/raw-files-not-found';
import { WavFileNotFound } from 'csdm/node/video/errors/wav-file-not-found';
import { isWindows } from 'csdm/node/os/is-windows';

async function assertWavFileExists(wavFilePath: string) {
  const exists = await fs.pathExists(wavFilePath);
  if (!exists) {
    throw new WavFileNotFound();
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

export async function getSequenceRawFiles(sequence: Sequence, recordingFolderPath: string, game: Game) {
  const sequenceName = getSequenceName(sequence);
  if (isWindows && game === Game.CSGO) {
    const sequenceRawFilesFolderPath = path.join(recordingFolderPath, sequenceName);
    await assertFolderExists(sequenceRawFilesFolderPath);

    const takeFolders = await glob(`take*`, {
      cwd: sequenceRawFilesFolderPath,
      absolute: true,
      onlyDirectories: true,
      deep: 1,
    });
    assertPathsNotEmpty(takeFolders);

    const hlaeRawFilesFolderPath = takeFolders[takeFolders.length - 1];
    await assertFolderExists(hlaeRawFilesFolderPath);

    const tgaFiles = await glob(`defaultNormal/*.tga`, {
      cwd: hlaeRawFilesFolderPath,
      absolute: true,
    });
    assertPathsNotEmpty(tgaFiles);

    const wavFilePath = path.resolve(hlaeRawFilesFolderPath, 'audio.wav');
    await assertWavFileExists(wavFilePath);

    return { tgaFiles, wavFilePath };
  }

  const sequenceRawFilesFolderPath = path.join(recordingFolderPath, sequenceName);
  await assertFolderExists(sequenceRawFilesFolderPath);

  logger.log(`Looking for raw files in ${sequenceRawFilesFolderPath} for sequence ${sequenceName}`);
  const tgaFiles = await glob(`**/${sequenceName}*.tga`, {
    cwd: recordingFolderPath,
    absolute: true,
  });
  assertPathsNotEmpty(tgaFiles);

  const wavFilePath = path.join(sequenceRawFilesFolderPath, `${sequenceName}.wav`);

  return { tgaFiles, wavFilePath };
}
