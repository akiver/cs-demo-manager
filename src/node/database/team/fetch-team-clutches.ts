import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import type { Clutch } from 'csdm/common/types/clutch';
import { clutchRowToClutch } from '../clutches/clutch-row-to-clutch';
import type { FetchTeamFilters } from './fetch-team-filters';

export async function fetchTeamClutches({
  name,
  startDate,
  endDate,
  sources,
  games,
  gameModes,
  tagIds,
  maxRounds,
  demoTypes,
}: FetchTeamFilters): Promise<Clutch[]> {
  let query = db
    .selectFrom('clutches')
    .selectAll()
    .leftJoin('matches', 'matches.checksum', 'clutches.match_checksum')
    .leftJoin('teams', 'teams.match_checksum', 'clutches.match_checksum')
    .where('teams.name', '=', name);

  if (startDate !== undefined && endDate !== undefined) {
    query = query.where(sql<boolean>`matches.date between ${startDate} and ${endDate}`);
  }

  if (sources.length > 0) {
    query = query.where('source', 'in', sources);
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

  if (tagIds.length > 0) {
    query = query
      .leftJoin('checksum_tags', 'checksum_tags.checksum', 'matches.checksum')
      .where('checksum_tags.tag_id', 'in', tagIds);
  }

  const rows = await query.execute();
  const clutches = rows.map(clutchRowToClutch);

  return clutches;
}
