import { db } from 'csdm/node/database/database';
import { TeamLetter } from 'csdm/common/types/counter-strike';
import { teamRowToTeam } from '../teams/team-row-to-team';
import type { Team } from 'csdm/common/types/team';

export async function fetchMatchTeamB(checksum: string): Promise<Team> {
  const teamRow = await db
    .selectFrom('teams')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .where('letter', '=', TeamLetter.B)
    .executeTakeFirst();

  if (teamRow === undefined) {
    throw new Error('Team B not found');
  }

  const teamB = teamRowToTeam(teamRow);

  return teamB;
}
