import { sql } from 'kysely';
import { DemoSource, type Rank } from 'csdm/common/types/counter-strike';
import { RankingFilter } from 'csdm/common/types/ranking-filter';
import { db } from 'csdm/node/database/database';
import type { FetchPlayerFilters } from './fetch-player-filters';

async function fetchMatchChecksumsWithPlayer({
  steamId,
  games,
  startDate,
  endDate,
  ranking,
  gameModes,
  tagIds,
  maxRounds,
  demoTypes,
}: FetchPlayerFilters) {
  let query = db
    .selectFrom('matches')
    .select(['matches.checksum', 'date'])
    .leftJoin('players', 'players.match_checksum', 'matches.checksum')
    .where('steam_id', '=', steamId)
    .where('source', '=', DemoSource.Valve)
    .$if(tagIds.length > 0, (query) => {
      return query
        .leftJoin('checksum_tags', 'checksum_tags.checksum', 'matches.checksum')
        .where('checksum_tags.tag_id', 'in', tagIds);
    });

  if (startDate !== undefined && endDate !== undefined) {
    query = query.where(sql<boolean>`matches.date between ${startDate} and ${endDate}`);
  }

  if (ranking !== RankingFilter.All) {
    const isRanked = ranking === RankingFilter.Ranked;
    query = query.where('is_ranked', '=', isRanked);
  }

  if (games.length > 0) {
    query = query.where('game', 'in', games);
  }

  if (demoTypes.length > 0) {
    query = query.where('type', 'in', demoTypes);
  }

  if (gameModes.length > 0) {
    query = query.where('game_mode_str', 'in', gameModes);
  }

  if (maxRounds.length > 0) {
    query = query.where('max_rounds', 'in', maxRounds);
  }

  const rows = await query.execute();
  const checksums = rows.map((row) => row.checksum);

  return checksums;
}

async function fetchPlayerEnemiesRankInMatches(
  { steamId, games, startDate, endDate, ranking, gameModes, tagIds, maxRounds, demoTypes }: FetchPlayerFilters,
  checksums: string[],
) {
  let query = db
    .selectFrom('players')
    .select(['rank'])
    .leftJoin('matches', 'matches.checksum', 'players.match_checksum')
    .select('date')
    .where('steam_id', '<>', steamId)
    .where('source', '=', DemoSource.Valve)
    .$if(tagIds.length > 0, (query) => {
      return query
        .leftJoin('checksum_tags', 'checksum_tags.checksum', 'matches.checksum')
        .where('checksum_tags.tag_id', 'in', tagIds);
    });

  if (checksums.length > 0) {
    query = query.where('matches.checksum', 'in', checksums);
  }

  if (startDate !== undefined && endDate !== undefined) {
    query = query.where(sql<boolean>`matches.date between ${startDate} and ${endDate}`);
  }

  if (ranking !== RankingFilter.All) {
    query = query.where('is_ranked', '=', ranking === RankingFilter.Ranked);
  }

  if (games.length > 0) {
    query = query.where('game', 'in', games);
  }

  if (demoTypes.length > 0) {
    query = query.where('type', 'in', demoTypes);
  }

  if (gameModes.length > 0) {
    query = query.where('game_mode_str', 'in', gameModes);
  }

  if (maxRounds.length > 0) {
    query = query.where('max_rounds', 'in', maxRounds);
  }

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
