import { sql } from 'kysely';
import { EconomyType } from '@akiver/cs-demo-analyzer';
import { db } from 'csdm/node/database/database';

export type PlayerEconomyStats = {
  steamId: string;
  averageMoneySpentPerRound: number;
  ecoCount: number;
  semiEcoCount: number;
  forceBuyCount: number;
  fullBuyCount: number;
};

export async function fetchPlayersEconomyStats(steamIds: string[]): Promise<PlayerEconomyStats[]> {
  const { avg } = db.fn;
  let query = db
    .selectFrom('player_economies')
    .select([
      'player_steam_id as steamId',
      avg<number>('money_spent').as('averageMoneySpentPerRound'),
      sql<number>`COUNT(CASE WHEN type = ${EconomyType.Eco} THEN 1 END)`.as('ecoCount'),
      sql<number>`COUNT(CASE WHEN type = ${EconomyType.Semi} THEN 1 END)`.as('semiEcoCount'),
      sql<number>`COUNT(CASE WHEN type = ${EconomyType.ForceBuy} THEN 1 END)`.as('forceBuyCount'),
      sql<number>`COUNT(CASE WHEN type = ${EconomyType.Full} THEN 1 END)`.as('fullBuyCount'),
    ])
    .orderBy('player_steam_id')
    .groupBy(['player_steam_id']);

  if (steamIds.length > 0) {
    query = query.where('player_steam_id', 'in', steamIds);
  }

  const rows = await query.execute();

  return rows;
}
