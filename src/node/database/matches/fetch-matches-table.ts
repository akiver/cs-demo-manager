import { sql } from 'kysely';
import type { MatchTable } from 'csdm/common/types/match-table';
import { TeamLetter } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';
import { RankingFilter } from 'csdm/common/types/ranking-filter';
import type { MatchTableRow } from 'csdm/node/database/matches/match-table-row';
import { matchTableRowToMatchTable } from './match-table-row-to-match-table';
import { fetchChecksumTags } from '../tags/fetch-checksum-tags';
import { fetchCollateralKillCountPerMatch } from './fetch-collateral-kill-count-per-match';
import type { MatchesTableFilter } from './matches-table-filter';

export async function fetchMatchesTable(
  filter: MatchesTableFilter & { steamId?: string; teamName?: string },
): Promise<MatchTable[]> {
  const { startDate, endDate, steamId, ranking, tagIds, sources, games, gameModes, maxRounds, demoTypes, teamName } =
    filter;
  let query = db
    .selectFrom('matches')
    .selectAll('matches')
    .innerJoin('teams as teamA', function (qb) {
      return qb.onRef('teamA.match_checksum', '=', 'matches.checksum').on('teamA.letter', '=', TeamLetter.A);
    })
    .select(['teamA.name as teamAName', 'teamA.score as teamAScore'])
    .innerJoin('teams as teamB', function (qb) {
      return qb.onRef('teamB.match_checksum', '=', 'matches.checksum').on('teamB.letter', '=', TeamLetter.B);
    })
    .select(['teamB.name as teamBName', 'teamB.score as teamBScore'])
    .leftJoin('players', 'players.match_checksum', 'matches.checksum')
    .leftJoin('comments', 'comments.checksum', 'matches.checksum')
    .select('comments.comment')
    .leftJoin('player_ban_per_match', 'player_ban_per_match.match_checksum', 'matches.checksum')
    .select('player_ban_count as banned_player_count')
    .groupBy([
      'matches.checksum',
      'comment',
      'teamAName',
      'teamBName',
      'teamAScore',
      'teamBScore',
      'banned_player_count',
    ]);

  if (steamId !== undefined) {
    query = query.where('players.steam_id', '=', steamId);
  }

  if (teamName !== undefined) {
    query = query.where((eb) => {
      return eb('teamA.name', '=', teamName).or('teamB.name', '=', teamName);
    });
  }

  if (startDate !== undefined && endDate !== undefined) {
    query = query.where(sql<boolean>`matches.date between ${startDate} and ${endDate}`);
  }

  if (ranking !== RankingFilter.All) {
    query = query.where('matches.is_ranked', '=', ranking === RankingFilter.Ranked);
  }

  if (sources.length > 0) {
    query = query.where('matches.source', 'in', sources);
  }

  if (games.length > 0) {
    query = query.where('matches.game', 'in', games);
  }

  if (demoTypes.length > 0) {
    query = query.where('matches.type', 'in', demoTypes);
  }

  if (gameModes.length > 0) {
    query = query.where('matches.game_mode_str', 'in', gameModes);
  }

  if (maxRounds.length > 0) {
    query = query.where('matches.max_rounds', 'in', maxRounds);
  }

  if (Array.isArray(tagIds) && tagIds.length > 0) {
    query = query
      .leftJoin('checksum_tags', 'checksum_tags.checksum', 'matches.checksum')
      .where('checksum_tags.tag_id', 'in', tagIds);
  }

  const rows: MatchTableRow[] = await query.execute();
  const collateralKillCountPerMatch = await fetchCollateralKillCountPerMatch();
  const checksumTags = await fetchChecksumTags();
  const matches: MatchTable[] = [];
  for (const row of rows) {
    const tagIds: string[] = checksumTags
      .filter((checksumTag) => {
        return checksumTag.checksum === row.checksum;
      })
      .map((checksumTag) => String(checksumTag.tag_id));
    const match = matchTableRowToMatchTable(row, tagIds, collateralKillCountPerMatch);
    matches.push(match);
  }

  return matches;
}
