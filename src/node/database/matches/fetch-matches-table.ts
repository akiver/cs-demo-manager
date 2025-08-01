import { sql } from 'kysely';
import type { MatchTable } from 'csdm/common/types/match-table';
import { TeamLetter } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';
import type { MatchTableRow } from 'csdm/node/database/matches/match-table-row';
import { matchTableRowToMatchTable } from './match-table-row-to-match-table';
import { fetchChecksumTags } from '../tags/fetch-checksum-tags';
import { fetchCollateralKillCountPerMatch } from './fetch-collateral-kill-count-per-match';
import { applyMatchFilters, type MatchFilters } from '../match/apply-match-filters';
import { fetchPlayersPerMatch } from './fetch-players-per-match';

type MatchTableFilters = MatchFilters & { steamId?: string; teamName?: string };

export async function fetchMatchesTable(filters: MatchTableFilters): Promise<MatchTable[]> {
  const { sum } = db.fn;
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
    .select([
      sum<number>('players.five_kill_count').as('fiveKillCount'),
      sum<number>('players.four_kill_count').as('fourKillCount'),
      sum<number>('players.three_kill_count').as('threeKillCount'),
      sql<number>`ROUND(AVG(players.hltv_rating_2)::numeric, 2)`.as('hltvRating2'),
    ])
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

  query = applyMatchFilters(query, filters);

  if (filters.steamId) {
    query = query.where('players.steam_id', '=', filters.steamId);
  }

  if (filters.teamName) {
    const { teamName } = filters;
    query = query.where((eb) => {
      return eb('teamA.name', '=', teamName).or('teamB.name', '=', teamName);
    });
  }

  const rows: MatchTableRow[] = await query.execute();
  const collateralKillCountPerMatch = await fetchCollateralKillCountPerMatch();
  const checksumTags = await fetchChecksumTags();
  const playersPerMatch = await fetchPlayersPerMatch(rows.map((row) => row.checksum));
  const matches: MatchTable[] = [];
  for (const row of rows) {
    const tagIds: string[] = checksumTags
      .filter((checksumTag) => {
        return checksumTag.checksum === row.checksum;
      })
      .map((checksumTag) => String(checksumTag.tag_id));
    const match = matchTableRowToMatchTable(row, tagIds, collateralKillCountPerMatch, playersPerMatch);
    matches.push(match);
  }

  return matches;
}
