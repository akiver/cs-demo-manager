export function windowsToUnixPathSeparator(path: string) {
  return path.replaceAll('\\', '/');
}
