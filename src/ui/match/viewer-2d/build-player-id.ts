// We don't use only the SteamID because it's not unique with BOTs (always 0).
export function buildPlayerId(playerSteamId: string, playerName: string) {
  return `${playerSteamId}-${playerName}`;
}
