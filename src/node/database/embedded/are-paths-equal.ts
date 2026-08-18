import path from 'node:path';

function normalizePathForComparison(filePath: string, platform = process.platform) {
  const pathImplementation = platform === 'win32' ? path.win32 : path.posix;
  const normalizedPath = pathImplementation.resolve(filePath);

  return platform === 'win32' ? normalizedPath.toLowerCase() : normalizedPath;
}

export function arePathsEqual(firstPath: string, secondPath: string, platform = process.platform) {
  return normalizePathForComparison(firstPath, platform) === normalizePathForComparison(secondPath, platform);
}
