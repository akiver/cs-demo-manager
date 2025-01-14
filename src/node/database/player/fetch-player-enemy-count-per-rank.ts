import { DemoSource, type Rank } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';
import { applyPlayerFilters, type FetchPlayerFilters } from './fetch-player-filters';

async function fetchMatchChecksumsWithPlayer(filters: FetchPlayerFilters) {
  let query = db
    .selectFrom('matches')
    .select(['matches.checksum', 'date'])
    .leftJoin('players', 'players.match_checksum', 'matches.checksum')
    .where('steam_id', '=', filters.steamId);

  query = applyPlayerFilters(query, { ...filters, sources: [DemoSource.Valve] });

  const rows = await query.execute();
  const checksums = rows.map((row) => row.checksum);

  return checksums;
}

async function fetchPlayerEnemiesRankInMatches(filters: FetchPlayerFilters, checksums: string[]) {
  let query = db
    .selectFrom('players')
    .select(['rank'])
    .leftJoin('matches', 'matches.checksum', 'players.match_checksum')
    .select('date')
    .where('steam_id', '<>', filters.steamId);

  if (checksums.length > 0) {
    query = query.where('matches.checksum', 'in', checksums);
  }

  query = applyPlayerFilters(query, { ...filters, sources: [DemoSource.Valve] });

  const enemiesRank = await query.execute();

  return enemiesRank;
}

export async function fetchPlayerEnemyCountPerRank(filters: FetchPlayerFilters): Promise<Record<Rank, number>> {
  const matchChecksumsWithPlayer = await fetchMatchChecksumsWithPlayer(filters);
  const enemiesRank = await fetchPlayerEnemiesRankInMatches(filters, matchChecksumsWithPlayer);

  const enemyCountPerRank: Record<Rank, number> = {};
  for (const { rank } of enemiesRank) {
    enemyCountPerRank[rank] = enemyCountPerRank[rank] ? enemyCountPerRank[rank] + 1 : 1;
  }

  return enemyCountPerRank;
}
