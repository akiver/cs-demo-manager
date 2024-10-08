import path from 'node:path';
import fs from 'fs-extra';
import { glob } from 'csdm/node/filesystem/glob';
import { Game } from 'csdm/common/types/counter-strike';
import type { Sequence } from 'csdm/common/types/sequence';
import { getSequenceName } from 'csdm/node/video/sequences/get-sequence-name';
import { getCsgoFolderPathOrThrow } from 'csdm/node/counter-strike/get-csgo-folder-path';
import { isWindows } from 'csdm/node/os/is-windows';
import { RawFilesNotFoundError } from 'csdm/node/video/errors/raw-files-not-found';

// Move the raw files of the sequences to the folder specified in the settings.
// We move it only for:
// - CS:GO on unix because HLAE that allows to set the destination folder is Windows only and the
// startmovie command place the files in the "csgo" folder (we can't change it).
// - CS2 because it's not yet possible with HLAE to set the destination folder and the startmovie command place the
// files in a "movie" folder (we can't change it).
export async function moveSequencesRawFiles(sequences: Sequence[], destinationFolderPath: string, game: Game) {
  const isCsgo = game === Game.CSGO;
  if (isWindows && isCsgo) {
    return;
  }

  const csgoFolderPath = await getCsgoFolderPathOrThrow(game);
  let recordingFolderPath: string;
  if (isCsgo) {
    recordingFolderPath = path.join(csgoFolderPath, 'csgo');
  } else {
    // The "movie" folder is inside our plugin folder
    recordingFolderPath = path.join(csgoFolderPath, 'game', 'csgo', 'csdm', 'movie');
  }

  const recordingFolderExists = await fs.pathExists(recordingFolderPath);
  if (!recordingFolderExists) {
    logger.error(`Recording folder does not exist ${recordingFolderPath}`);
    throw new RawFilesNotFoundError();
  }

  logger.log(`Moving sequences raw files from ${recordingFolderPath} to ${destinationFolderPath}`);

  for (const sequence of sequences) {
    const sequenceName = getSequenceName(sequence);
    const tgaFiles = await glob(`**/${sequenceName}*.tga`, {
      cwd: recordingFolderPath,
      followSymbolicLinks: false,
      absolute: true,
      onlyFiles: true,
    });
    logger.log(
      `TGA files found for sequence ${sequenceName} ${sequence.startTick} ${sequence.endTick}: ${tgaFiles.length}`,
    );
    if (tgaFiles.length === 0) {
      logger.error(`TGA files not found for sequence ${sequenceName}`);
      throw new RawFilesNotFoundError();
    }

    logger.log(`First TGA file: ${tgaFiles[0]}`);
    if (tgaFiles.length > 1) {
      logger.log(`Last TGA file: ${tgaFiles[tgaFiles.length - 1]}`);
    }

    const rawFilesFolderPath = path.dirname(tgaFiles[0]);
    logger.log(`Sequence raw files folder: ${rawFilesFolderPath}`);

    const destinationPath = path.join(destinationFolderPath, sequenceName);
    await fs.ensureDir(destinationPath);

    let wavFileFolderPath = rawFilesFolderPath;
    if (!isCsgo) {
      // Since the "Armory" update the wav files are created inside csgo/movie instead of csgo/csdm/movie.
      // Remove the last occurrence of "/csdm/" to get the correct path.
      wavFileFolderPath = rawFilesFolderPath.replace(/csdm\/(?!.*csdm\/)/, '');
    }
    logger.log(`WAV file folder path: ${wavFileFolderPath}`);

    const wavFilePath = path.join(wavFileFolderPath, isCsgo ? `${sequenceName}.WAV` : `${sequenceName}.wav`);
    if (await fs.pathExists(wavFilePath)) {
      await fs.move(wavFilePath, path.join(destinationPath, `${sequenceName}.wav`));
    }

    await Promise.all(
      tgaFiles.map((tgaFile) => {
        return fs.move(tgaFile, path.join(destinationPath, path.basename(tgaFile)));
      }),
    );
  }
}
