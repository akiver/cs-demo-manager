export function specLock(index: number, startTick: number, steamId: string) {
  return `
  "${index}"
  {
    factory "PlayCommands"
    name "spec${index}"
    starttick "${startTick}"
    commands "spec_lock_to_accountid ${steamId}"
  }`;
}
