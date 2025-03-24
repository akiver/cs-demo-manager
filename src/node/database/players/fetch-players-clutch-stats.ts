import { db } from 'csdm/node/database/database';
import { sql } from 'kysely';

export type PlayerClutchStats = {
  clutcherSteamId: string;
  totalCount: number;
  vsOneCount: number;
  vsOneWonCount: number;
  vsOneLostCount: number;
  vsTwoCount: number;
  vsTwoWonCount: number;
  vsTwoLostCount: number;
  vsThreeCount: number;
  vsThreeWonCount: number;
  vsThreeLostCount: number;
  vsFourCount: number;
  vsFourWonCount: number;
  vsFourLostCount: number;
  vsFiveCount: number;
  vsFiveWonCount: number;
  vsFiveLostCount: number;
};

export async function fetchPlayersClutchStats(checksums: string[], steamIds: string[]): Promise<PlayerClutchStats[]> {
  const { count } = db.fn;
  let query = db
    .selectFrom('clutches')
    .select([
      'clutcher_steam_id as clutcherSteamId',
      count<number>('id').as('totalCount'),
      sql<number>`COUNT(CASE WHEN opponent_count = 1 THEN 1 END)`.as('vsOneCount'),
      sql<number>`COUNT(CASE WHEN opponent_count = 1 AND won = TRUE THEN 1 END)`.as('vsOneWonCount'),
      sql<number>`COUNT(CASE WHEN opponent_count = 1 AND won = FALSE THEN 1 END)`.as('vsOneLostCount'),
      sql<number>`COUNT(CASE WHEN opponent_count = 2 THEN 1 END)`.as('vsTwoCount'),
      sql<number>`COUNT(CASE WHEN opponent_count = 2 AND won = TRUE THEN 1 END)`.as('vsTwoWonCount'),
      sql<number>`COUNT(CASE WHEN opponent_count = 2 AND won = FALSE THEN 1 END)`.as('vsTwoLostCount'),
      sql<number>`COUNT(CASE WHEN opponent_count = 3 THEN 1 END)`.as('vsThreeCount'),
      sql<number>`COUNT(CASE WHEN opponent_count = 3 AND won = TRUE THEN 1 END)`.as('vsThreeWonCount'),
      sql<number>`COUNT(CASE WHEN opponent_count = 3 AND won = FALSE THEN 1 END)`.as('vsThreeLostCount'),
      sql<number>`COUNT(CASE WHEN opponent_count = 4 THEN 1 END)`.as('vsFourCount'),
      sql<number>`COUNT(CASE WHEN opponent_count = 4 AND won = TRUE THEN 1 END)`.as('vsFourWonCount'),
      sql<number>`COUNT(CASE WHEN opponent_count = 4 AND won = FALSE THEN 1 END)`.as('vsFourLostCount'),
      sql<number>`COUNT(CASE WHEN opponent_count = 5 THEN 1 END)`.as('vsFiveCount'),
      sql<number>`COUNT(CASE WHEN opponent_count = 5 AND won = TRUE THEN 1 END)`.as('vsFiveWonCount'),
      sql<number>`COUNT(CASE WHEN opponent_count = 5 AND won = FALSE THEN 1 END)`.as('vsFiveLostCount'),
    ])
    .orderBy('clutcher_steam_id')
    .groupBy(['clutches.clutcher_steam_id']);

  if (steamIds.length > 0) {
    query = query.where('clutches.clutcher_steam_id', 'in', steamIds);
  }
  if (checksums.length > 0) {
    query = query.where('clutches.match_checksum', 'in', checksums);
  }

  const rows = await query.execute();

  return rows;
}
