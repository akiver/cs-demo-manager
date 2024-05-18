import { sql } from 'kysely';
import { TeamLetter } from 'csdm/common/types/counter-strike';
import type { LastMatch } from 'csdm/common/types/last-match';
import { db } from 'csdm/node/database/database';

export async function fetchPlayerLastMatches(steamId: string): Promise<LastMatch[]> {
  const matches = await db
    .selectFrom('matches')
    .select([
      'matches.checksum',
      'matches.game',
      'map_name as mapName',
      'winner_name as winnerName',
      sql<string>`to_char(matches.date, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as('date'),
    ])
    .innerJoin('players', 'players.match_checksum', 'matches.checksum')
    .select('players.team_name as focusTeamName')
    .innerJoin('teams as teamA', function (qb) {
      return qb.on('teamA.letter', '=', TeamLetter.A).onRef('teamA.match_checksum', '=', 'matches.checksum');
    })
    .select(['teamA.score as scoreTeamA'])
    .innerJoin('teams as teamB', function (qb) {
      return qb.on('teamB.letter', '=', TeamLetter.B).onRef('teamB.match_checksum', '=', 'matches.checksum');
    })
    .select(['teamB.score as scoreTeamB'])
    .where('players.steam_id', '=', steamId)
    .orderBy('date', 'desc')
    .limit(8)
    .execute();

  return matches;
}
