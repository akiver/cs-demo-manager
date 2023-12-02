export function specPlayer(index: number, startTick: number, steamId: string) {
  return `
  "${index}"
  {
    factory "PlayCommands"
    name "spec${index}"
    starttick "${startTick}"
    commands "spec_player_by_accountid ${steamId}"
  }`;
}
