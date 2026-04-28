export function stringContainsOnlyBasicLatinChars(str: string) {
  // oxlint-disable-next-line no-control-regex
  return /^[\x00-\x7F]*$/.test(str);
}
