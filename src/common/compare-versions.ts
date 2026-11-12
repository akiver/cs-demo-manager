export function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const part1 = v1Parts[i] ?? 0;
    const part2 = v2Parts[i] ?? 0;

    if (part1 !== part2) {
      return part1 - part2;
    }
  }

  return 0;
}
