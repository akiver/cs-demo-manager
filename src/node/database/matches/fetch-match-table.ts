import type { MatchTable } from 'csdm/common/types/match-table';
import { TeamLetter } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';
import { fetchChecksumTagIds } from '../tags/fetch-checksum-tag-ids';
import { MatchNotFound } from './errors/match-not-found';
import { fetchCollateralKillCountPerMatch } from './fetch-collateral-kill-count-per-match';
import { matchTableRowToMatchTable } from './match-table-row-to-match-table';

export async function fetchMatchTable(checksum: string): Promise<MatchTable> {
  const row = await db
    .selectFrom('matches')
    .selectAll('matches')
    .innerJoin('teams as teamA', function (qb) {
      return qb.on('teamA.letter', '=', TeamLetter.A).onRef('teamA.match_checksum', '=', 'matches.checksum');
    })
    .select(['teamA.name as teamAName', 'teamA.score as teamAScore'])
    .innerJoin('teams as teamB', function (qb) {
      return qb.on('teamB.letter', '=', TeamLetter.B).onRef('teamB.match_checksum', '=', 'matches.checksum');
    })
    .select(['teamB.name as teamBName', 'teamB.score as teamBScore'])
    .leftJoin('player_ban_per_match', 'player_ban_per_match.match_checksum', 'matches.checksum')
    .select('player_ban_count as banned_player_count')
    .leftJoin('comments', 'comments.checksum', 'matches.checksum')

    .select('comments.comment')
    .where('matches.checksum', '=', checksum)
    .executeTakeFirst();

  if (row === undefined) {
    throw new MatchNotFound();
  }

  const tagIds = await fetchChecksumTagIds(row.checksum);
  const collateralKillCountPerMatch = await fetchCollateralKillCountPerMatch([row.checksum]);
  const match: MatchTable = matchTableRowToMatchTable(row, tagIds, collateralKillCountPerMatch);

  return match;
}
