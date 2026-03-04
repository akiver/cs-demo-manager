import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import { TeamLetter } from 'csdm/common/types/counter-strike';
import type { LastMatch } from 'csdm/common/types/last-match';

export async function fetchTeamLastMatches(teamName: string): Promise<LastMatch[]> {
  const matches = await db
    .selectFrom('matches')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .innerJoin('teams as teamA', function (qb) {
      return qb.on('teamA.letter', '=', TeamLetter.A).onRef('teamA.match_checksum', '=', 'matches.checksum');
    })
    .innerJoin('teams as teamB', function (qb) {
      return qb.on('teamB.letter', '=', TeamLetter.B).onRef('teamB.match_checksum', '=', 'matches.checksum');
    })
    .where((eb) => {
      return eb('teamA.name', '=', teamName).or('teamB.name', '=', teamName);
    })
    .orderBy('demos.date', 'desc')
    .limit(8)
    .select([
      sql<string>`${teamName}`.as('focusTeamName'),
      'matches.checksum',
      'demos.game',
      'demos.map_name as mapName',
      'matches.winner_name as winnerName',
      sql<string>`to_char(demos.date, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as('date'),
      'teamA.score as scoreTeamA',
      'teamB.score as scoreTeamB',
    ])
    .execute();

  return matches;
}
