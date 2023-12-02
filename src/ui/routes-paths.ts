export const RoutePath = {
  Demos: '/demos',
  Matches: '/matches',
  MatchHeatmap: 'heatmap',
  MatchRounds: 'rounds',
  MatchPlayers: 'players',
  MatchWeapons: 'weapons',
  MatchGrenades: 'grenades',
  MatchGrenadesFinder: 'finder',
  Match2dViewer: 'viewer-2d',
  MatchVideo: 'video',
  MatchChat: 'chat',
  MatchEconomy: 'economy',
  Analyses: '/analyses',
  Players: '/players',
  PlayerCharts: 'charts',
  PlayerRank: 'rank',
  PlayerMatches: 'matches',
  PlayerMaps: 'maps',
  PinnerPlayer: '/pinned-player',
  Search: '/search',
  Downloads: '/downloads',
  DownloadsFaceit: 'faceit',
  DownloadsPending: 'pending',
  Ban: '/ban',
} as const;
export type RoutePath = (typeof RoutePath)[keyof typeof RoutePath];

export function buildDemoPath(demoPath: string) {
  const sanitizedPath = encodeURIComponent(demoPath);
  return `${RoutePath.Demos}/${sanitizedPath}`;
}

export function buildMatchPath(checksum: string) {
  return `${RoutePath.Matches}/${checksum}`;
}

export function buildMatchRoundsPath(checksum: string) {
  return `${RoutePath.Matches}/${checksum}/${RoutePath.MatchRounds}`;
}

export function buildMatchPlayerPath(checksum: string, steamId: string) {
  return `${RoutePath.Matches}/${checksum}/${RoutePath.MatchPlayers}/${steamId}`;
}

export function buildMatchRoundPath(checksum: string, roundNumber: number) {
  return `${buildMatchRoundsPath(checksum)}/${roundNumber}`;
}

export function buildMatch2dViewerRoundPath(checksum: string, roundNumber: number) {
  return `${buildMatchPath(checksum)}/${RoutePath.Match2dViewer}/${roundNumber}`;
}

export function buildMatchVideoPath(checksum: string) {
  return `${buildMatchPath(checksum)}/${RoutePath.MatchVideo}`;
}

export function buildPlayerPath(playerSteamId: string) {
  return `${RoutePath.Players}/${playerSteamId}`;
}

export function buildPlayerMatchesPath(playerSteamId: string) {
  return `${buildPlayerPath(playerSteamId)}/${RoutePath.PlayerMatches}`;
}

export function buildPendingDownloadPath() {
  return `${RoutePath.Downloads}/${RoutePath.DownloadsPending}`;
}
