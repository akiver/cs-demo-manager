export function skipAhead(index: number, startTick: number, goToTick: number) {
  return `
  "${index}"
  {
    factory "SkipAhead"
    name "SkipAhead${index}"
    starttick "${startTick}"
    skiptotick "${goToTick}"
  }`;
}
