import fs from 'fs-extra';
import { glob } from 'csdm/node/filesystem/glob';
import { InvalidArgument } from './errors/invalid-argument';

/**
 * Returns the .dem files paths from paths that can be either .dem files or folders containing .dem files.
 */
export async function resolveDemoPaths(paths: string[]) {
  const demoPaths: string[] = [];
  for (const demoOrFolderPath of paths) {
    const stats = await fs.stat(demoOrFolderPath).catch(() => undefined);
    if (stats?.isDirectory()) {
      const files = await glob('*.dem', {
        cwd: demoOrFolderPath,
        absolute: true,
      });
      demoPaths.push(...files);
    } else if (stats?.isFile() && demoOrFolderPath.endsWith('.dem')) {
      demoPaths.push(demoOrFolderPath);
    } else {
      throw new InvalidArgument(`Invalid demo path: ${demoOrFolderPath}`);
    }
  }

  return demoPaths;
}
