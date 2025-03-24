import { DemoSource, type Rank } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';
import { applyMatchFilters, type MatchFilters } from '../match/apply-match-filters';

async function fetchMatchChecksumsWithPlayer(steamId: string, filters: MatchFilters) {
  let query = db
    .selectFrom('matches')
    .select(['matches.checksum', 'date'])
    .leftJoin('players', 'players.match_checksum', 'matches.checksum')
    .where('steam_id', '=', steamId);

  query = applyMatchFilters(query, { ...filters, demoSources: [DemoSource.Valve] });

  const rows = await query.execute();
  const checksums = rows.map((row) => row.checksum);

  return checksums;
}

async function fetchPlayerEnemiesRankInMatches(steamId: string, checksums: string[], filters: MatchFilters) {
  let query = db
    .selectFrom('players')
    .select(['rank'])
    .leftJoin('matches', 'matches.checksum', 'players.match_checksum')
    .select('date')
    .where('steam_id', '<>', steamId);

  if (checksums.length > 0) {
    query = query.where('matches.checksum', 'in', checksums);
  }

  query = applyMatchFilters(query, { ...filters, demoSources: [DemoSource.Valve] });

  const enemiesRank = await query.execute();

  return enemiesRank;
}

export async function fetchPlayerEnemyCountPerRank(
  steamId: string,
  filters: MatchFilters,
): Promise<Record<Rank, number>> {
  const matchChecksumsWithPlayer = await fetchMatchChecksumsWithPlayer(steamId, filters);
  const enemiesRank = await fetchPlayerEnemiesRankInMatches(steamId, matchChecksumsWithPlayer, filters);

  const enemyCountPerRank: Record<Rank, number> = {};
  for (const { rank } of enemiesRank) {
    enemyCountPerRank[rank] = enemyCountPerRank[rank] ? enemyCountPerRank[rank] + 1 : 1;
  }

  return enemyCountPerRank;
}
