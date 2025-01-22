import fs from 'fs-extra';
import path from 'node:path';

export async function moveFiles(files: string[], outputFolderPath: string) {
  await Promise.all(
    files.map((file) => {
      return fs.move(file, path.join(outputFolderPath, path.basename(file)));
    }),
  );
}
