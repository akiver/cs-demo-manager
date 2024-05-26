import { TeamLetter } from '@akiver/cs-demo-analyzer';
import { db } from '../database';

export type TeamNamesPerChecksum = { [checksum: string]: { teamNameA: string; teamNameB: string } };

export async function fetchTeamNamesPerChecksum(checksums: string[]): Promise<TeamNamesPerChecksum> {
  const rows = await db
    .selectFrom('teams as ta')
    .innerJoin('teams as tb', 'ta.match_checksum', 'tb.match_checksum')
    .select(['ta.match_checksum as checksum', 'ta.name as teamNameA', 'tb.name as teamNameB'])
    .where('ta.match_checksum', 'in', checksums)
    .where('ta.letter', '=', TeamLetter.A)
    .where('tb.letter', '=', TeamLetter.B)
    .execute();

  const teamNamesPerChecksum: TeamNamesPerChecksum = {};
  rows.forEach((row) => {
    teamNamesPerChecksum[row.checksum] = {
      teamNameA: row.teamNameA,
      teamNameB: row.teamNameB,
    };
  });

  return teamNamesPerChecksum;
}
