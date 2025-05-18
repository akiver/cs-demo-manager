export const RoutePath = {
  Demos: '/demos',
  Matches: '/matches',
  MatchHeatmap: 'heatmap',
  MatchRounds: 'rounds',
  MatchPlayers: 'players',
  MatchWeapons: 'weapons',
  MatchDuels: 'duels',
  MatchOpeningDuelsStats: 'opening-duels-stats',
  MatchOpeningDuelsMap: 'opening-duels-map',
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
  Downloads5EPlay: '5eplay',
  DownloadsPending: 'pending',
  Ban: '/ban',
  Teams: '/teams',
  TeamHeatmap: 'heatmap',
  TeamMatches: 'matches',
  TeamPerformance: 'performance',
  TeamMaps: 'maps',
  Videos: '/videos',
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

export function buildTeamPath(name: string) {
  return `${RoutePath.Teams}/${name}`;
}
