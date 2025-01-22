import path from 'node:path';
import { glob } from 'csdm/node/filesystem/glob';
import type { Sequence } from 'csdm/common/types/sequence';
import { getHlaeTakeFolderPath } from 'csdm/node/video/generation/get-sequence-raw-files';
import { moveFiles } from 'csdm/node/filesystem/move-files';
import { getSequenceOutputFolderPath } from 'csdm/node/video/generation/get-sequence-output-folder-path';
import { Game } from 'csdm/common/types/counter-strike';

type Options = {
  sequences: Sequence[];
  outputFolderPath: string;
  game: Game;
};

export async function moveHlaeRawFilesToOutputFolder({ sequences, outputFolderPath, game }: Options) {
  const isCsgo = game === Game.CSGO;
  for (const sequence of sequences) {
    const sequenceOutputFolderPath = getSequenceOutputFolderPath(sequence, outputFolderPath);
    const takeFolderPath = await getHlaeTakeFolderPath(sequenceOutputFolderPath);
    const files = await glob(isCsgo ? 'defaultNormal/*' : '*', {
      cwd: takeFolderPath,
      absolute: true,
      onlyFiles: true,
      deep: 1,
    });

    if (isCsgo) {
      files.push(path.join(takeFolderPath, 'audio.wav'));
    }

    await moveFiles(files, sequenceOutputFolderPath);
  }
}
