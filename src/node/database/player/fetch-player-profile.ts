import { fetchPlayerMapsStats } from './fetch-player-maps-stats';
import { fetchPlayerCompetitiveRankHistory } from './fetch-player-competitive-rank-history';
import { fetchPlayerChartsData } from './fetch-player-charts-data';
import { fetchPlayerLastMatches } from './fetch-player-last-matches';
import type { PlayerProfile } from '../../../common/types/player-profile';
import { fetchPlayerEnemyCountPerRank } from './fetch-player-enemy-count-per-rank';
import { fetchMatchesTable } from '../matches/fetch-matches-table';
import { type MatchFilters } from '../match/apply-match-filters';
import { fetchPlayerClutches } from './fetch-player-clutches';
import { fetchPlayerPremierRankHistory } from './fetch-player-premier-rank-history';
import { fetchPlayersTagIds } from '../tags/fetch-players-tag-ids';
import { fetchPlayer } from './fetch-player';

export async function fetchPlayerProfile(steamId: string, filters: MatchFilters): Promise<PlayerProfile> {
  const [
    player,
    competitiveRankHistory,
    premierRankHistory,
    chartsData,
    enemyCountPerRank,
    lastMatches,
    matches,
    mapsStats,
    clutches,
    tagIds,
  ] = await Promise.all([
    fetchPlayer(steamId, filters),
    fetchPlayerCompetitiveRankHistory(steamId, filters),
    fetchPlayerPremierRankHistory(steamId, filters),
    fetchPlayerChartsData(steamId, filters),
    fetchPlayerEnemyCountPerRank(steamId, filters),
    fetchPlayerLastMatches(steamId),
    fetchMatchesTable({ ...filters, steamId }),
    fetchPlayerMapsStats(steamId, filters),
    fetchPlayerClutches(steamId, filters),
    fetchPlayersTagIds([steamId]),
  ]);
  const playerProfile: PlayerProfile = {
    ...player,
    competitiveRankHistory,
    premierRankHistory,
    chartsData,
    enemyCountPerRank,
    lastMatches,
    matches,
    mapsStats,
    clutches,
    tagIds,
  };

  return playerProfile;
}
