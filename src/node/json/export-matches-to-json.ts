import fs from 'node:fs/promises';
import path from 'node:path';
import { fetchMatchesForJsonExport } from 'csdm/node/database/json/fetch-matches-for-json-export';

type Options = {
  outputFolderPath: string;
  checksums: string[];
  minify: boolean;
};

export async function exportMatchesToJson({ outputFolderPath, checksums, minify }: Options) {
  const matches = await fetchMatchesForJsonExport(checksums);

  for (const match of matches) {
    const outputFilePath = path.join(outputFolderPath, `${match.name}.json`);
    const json = minify ? JSON.stringify(match) : JSON.stringify(match, null, 2);
    await fs.writeFile(outputFilePath, json);
  }
}
