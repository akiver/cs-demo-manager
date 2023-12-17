import path from 'node:path';
import fs from 'fs-extra';
import glob from 'tiny-readdir-glob';
import { Game } from 'csdm/common/types/counter-strike';
import type { Sequence } from 'csdm/common/types/sequence';
import { getSequenceName } from 'csdm/node/video/sequences/get-sequence-name';
import { getCsgoFolderPathOrThrow } from 'csdm/node/counter-strike/get-csgo-folder-path';
import { isWindows } from 'csdm/node/os/is-windows';
import { RawFilesNotFoundError } from 'csdm/node/video/errors/raw-files-not-found';
import { WavFileNotFound } from 'csdm/node/video/errors/wav-file-not-found';

// Move the raw files of the sequences to the folder specified in the settings.
// We move it only for:
// - CS:GO on unix because HLAE that allows to set the destination folder is Windows only and the
// startmovie command place the files in the "csgo" folder (we can't change it).
// - CS2 because it's not yet possible with HLAE to set the destination folder and the startmovie command place the
// files in a "movie" folder (we can't change it).
export async function moveSequencesRawFiles(sequences: Sequence[], destinationFolderPath: string, game: Game) {
  if (isWindows && game === Game.CSGO) {
    return;
  }

  const csgoFolderPath = await getCsgoFolderPathOrThrow(game);
  let recordingFolderPath: string;
  if (isWindows) {
    // The "movie" folder is inside our plugin folder
    recordingFolderPath = path.join(csgoFolderPath, 'game', 'csgo', 'csdm', 'movie');
  } else {
    recordingFolderPath = path.join(csgoFolderPath, 'csgo');
  }

  const recordingFolderExists = await fs.pathExists(recordingFolderPath);
  if (!recordingFolderExists) {
    throw new RawFilesNotFoundError();
  }

  for (const sequence of sequences) {
    const sequenceName = getSequenceName(sequence);
    const { files: tgaFiles } = await glob(`**/*${sequenceName}*.tga`, {
      cwd: recordingFolderPath,
    });
    if (tgaFiles.length === 0) {
      throw new RawFilesNotFoundError();
    }

    const rawFilesFolderPath = path.dirname(tgaFiles[0]);
    const wavFilePath = path.join(rawFilesFolderPath, isWindows ? `${sequenceName}.wav` : `${sequenceName}.WAV`);
    if (!(await fs.pathExists(wavFilePath))) {
      throw new WavFileNotFound();
    }

    const destinationPath = path.join(destinationFolderPath, sequenceName);
    await fs.ensureDir(destinationPath);

    await Promise.all(
      tgaFiles.map((tgaFile) => {
        return fs.move(tgaFile, path.join(destinationPath, path.basename(tgaFile)));
      }),
    );
    await fs.move(wavFilePath, path.join(destinationPath, `${sequenceName}.wav`));
  }
}
