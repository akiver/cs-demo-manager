type PlayerGrenadeSummary = {
  steamId: string;
  matchCount: number;
  roundCount: number;
  flashbangsThrownCount: number;
  heGrenadesThrownCount: number;
  smokeGrenadesThrownCount: number;
  fireGrenadesThrownCount: number;
  averageFlashbangsThrownPerMatch: number;
  averageHeGrenadesThrownPerMatch: number;
  averageSmokeGrenadesThrownPerMatch: number;
  averageFireGrenadesThrownPerMatch: number;
  averageFlashbangsThrownPerRound: number;
  averageHeGrenadesThrownPerRound: number;
  averageSmokeGrenadesThrownPerRound: number;
  averageFireGrenadesThrownPerRound: number;
  flashedEnemyCount: number;
  totalEnemyBlindDuration: number;
  averageEnemyBlindDuration: number;
  averageFlashedEnemiesPerFlashbang: number;
  averageFlashedEnemiesPerMatch: number;
  heDamage: number;
  averageHeDamagePerThrow: number;
  averageHeDamagePerMatch: number;
  heKillCount: number;
  fireDamage: number;
  averageFireDamagePerThrow: number;
  averageFireDamagePerMatch: number;
};

export type PlayerFlashbangMatchup = {
  steamId: string;
  name: string;
  count: number;
  totalDuration: number;
  averageDuration: number;
};

export type PlayerGrenadesStats = {
  summary: PlayerGrenadeSummary;
  flashedPlayers: PlayerFlashbangMatchup[];
  flashedByPlayers: PlayerFlashbangMatchup[];
};
