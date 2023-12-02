import fs from 'node:fs/promises';
import path from 'node:path';
import { fetchMatchesByChecksums } from 'csdm/node/database/matches/fetch-matches-by-checksums';

type Options = {
  outputFolderPath: string;
  checksums: string[];
  minify: boolean;
};

export async function exportMatchesToJson({ outputFolderPath, checksums, minify }: Options) {
  const matches = await fetchMatchesByChecksums(checksums);

  for (const match of matches) {
    const outputFilePath = path.join(outputFolderPath, `${match.name}.json`);
    const json = minify ? JSON.stringify(match) : JSON.stringify(match, null, 2);
    await fs.writeFile(outputFilePath, json);
  }
}
