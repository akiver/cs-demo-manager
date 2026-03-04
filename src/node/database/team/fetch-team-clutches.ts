import { db } from 'csdm/node/database/database';
import type { Clutch } from 'csdm/common/types/clutch';
import { clutchRowToClutch } from '../clutches/clutch-row-to-clutch';
import type { TeamFilters } from './team-filters';
import { applyMatchFilters } from '../match/apply-match-filters';

export async function fetchTeamClutches({ name, ...filters }: TeamFilters): Promise<Clutch[]> {
  let query = db
    .selectFrom('clutches')
    .selectAll()
    .innerJoin('matches', 'matches.checksum', 'clutches.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .innerJoin('teams', 'teams.match_checksum', 'clutches.match_checksum')
    .where('teams.name', '=', name);

  query = applyMatchFilters(query, filters);

  const rows = await query.execute();
  const clutches = rows.map(clutchRowToClutch);

  return clutches;
}
