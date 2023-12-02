/**
 * If a path contains unsupported CSGO chars, the playback will not start and the game will be stuck on the home screen.
 * CS2 is not affected by this issue.
 */
export function pathContainsInvalidCsgoChars(path: string) {
  return /[&;@^]/g.test(path);
}
