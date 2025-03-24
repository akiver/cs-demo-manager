import { sql } from 'kysely';
import { CompetitiveRank } from 'csdm/common/types/counter-strike';
import type { CompetitiveRankHistory } from 'csdm/common/types/charts/competitive-rank-history';
import { db } from 'csdm/node/database/database';
import type { MatchFilters } from '../match/apply-match-filters';

export async function fetchPlayerCompetitiveRankHistory(
  steamId: string,
  { startDate, endDate }: MatchFilters,
): Promise<CompetitiveRankHistory[]> {
  let query = db
    .selectFrom('players')
    .select(['rank as rank', 'old_rank as oldRank', 'wins_count as winCount'])
    .innerJoin('matches', 'matches.checksum', 'players.match_checksum')
    .select('matches.date')
    .where('steam_id', '=', steamId)
    .where('rank', '>', CompetitiveRank.Unknown)
    .where('rank', '<=', CompetitiveRank.GlobalElite)
    .orderBy('date', 'asc');

  if (startDate && endDate) {
    query = query.where(sql<boolean>`matches.date between ${startDate} and ${endDate}`);
  }

  const rows = await query.execute();

  const rankHistories: CompetitiveRankHistory[] = [];
  let lastKnowRank: CompetitiveRank | -1 = -1;
  for (const row of rows) {
    const rank = row.rank as CompetitiveRank;
    if (lastKnowRank !== rank) {
      rankHistories.push({
        matchDate: row.date.toISOString(),
        rank,
        winCount: row.winCount,
        oldRank: lastKnowRank === -1 ? (row.oldRank as CompetitiveRank) : lastKnowRank,
      });
    }
    lastKnowRank = rank;
  }

  return rankHistories;
}
