export function stopPlayback(index: number, startTick: number) {
  return `
  "${index}"
  {
    factory "StopPlayback"
    name "stop${index}"
    starttick "${startTick}"
  }`;
}
