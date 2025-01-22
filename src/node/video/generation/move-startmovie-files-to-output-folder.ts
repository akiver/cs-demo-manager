import path from 'node:path';
import fs from 'fs-extra';
import type { Game } from 'csdm/common/types/counter-strike';
import type { Sequence } from 'csdm/common/types/sequence';
import { getSequenceName } from 'csdm/node/video/generation/get-sequence-name';
import { moveFiles } from 'csdm/node/filesystem/move-files';
import { getStartMovieRawFiles } from 'csdm/node/video/generation/get-sequence-raw-files';

type Options = {
  sequences: Sequence[];
  outputFolderPath: string;
  game: Game;
};

// Move the files created by the CS startmovie command to the folder specified in the settings.
// We can't ask the startmovie command to save the files in a specific location, so we need to move them after recording
export async function moveStartMovieFilesToOutputFolder({ sequences, outputFolderPath, game }: Options) {
  for (const sequence of sequences) {
    const sequenceName = getSequenceName(sequence);
    const { tgaFiles, wavFilePath } = await getStartMovieRawFiles({ sequence, game });

    const destinationPath = path.join(outputFolderPath, sequenceName);
    await fs.ensureDir(destinationPath);

    await moveFiles(tgaFiles, destinationPath);
    await fs.move(wavFilePath, path.join(destinationPath, `${sequenceName}.wav`));
  }
}
